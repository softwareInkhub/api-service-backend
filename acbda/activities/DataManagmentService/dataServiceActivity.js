import { v4 as uuidv4 } from 'uuid';
import { firebaseClientActivity } from './firebaseClientActivity.js';
import Ajv from 'ajv';
import axios from 'axios';
import { DataBuilder } from '../../builder/DataBuilder.js';
import { SchemaService } from './schemaServiceActivity.js';

class DataService {
    constructor() {
        this.schemaService = SchemaService.getInstance();
        this.ajv = new Ajv({
            strict: false,
            allErrors: true
        });
    }

    static getInstance() {
        if (!DataService.instance) {
            DataService.instance = new DataService();
        }
        return DataService.instance;
    }

    async getSchemaById(schemaId) {
        try {
            const schemas = await firebaseClientActivity.getAllDocuments('schema');
            const schema = schemas.find(s => s.uuid === schemaId);
            if (!schema) {
                throw new Error(`Schema with id ${schemaId} not found`);
            }
            return {
                ...schema,
                parsedSchema: JSON.parse(schema.schema)
            };
        } catch (error) {
            console.error('Error fetching schema:', error);
            throw error;
        }
    }

    async getSchemaRelationships(schema) {
        const relationships = {};
        const properties = JSON.parse(schema.schema).properties;

        for (const [key, prop] of Object.entries(properties)) {
            if (prop.type === 'object' && prop.schemaId) {
                relationships[key] = { schemaId: prop.schemaId, isArray: false };
            } else if (prop.type === 'array' && prop.items?.schemaId) {
                relationships[key] = { schemaId: prop.items.schemaId, isArray: true };
            }
        }

        return relationships;
    }

    async validateNestedData(data, schemaId) {
        try {
            const schema = await this.getSchemaById(schemaId);
            const relationships = await this.getSchemaRelationships(schema);

            // Create validation schema with nested references resolved
            const validationSchema = {
                type: 'object',
                properties: JSON.parse(schema.schema).properties,
                required: JSON.parse(schema.schema).required || [],
                additionalProperties: false
            };

            // Validate main schema
            const validate = this.ajv.compile(validationSchema);
            const isValid = validate(data);

            if (!isValid) {
                throw new Error(`Validation failed: ${this.ajv.errorsText(validate.errors)}`);
            }

            // Validate nested schemas
            for (const [field, relationship] of Object.entries(relationships)) {
                if (data[field]) {
                    const nestedData = Array.isArray(data[field]) ? data[field] : [data[field]];
                    for (const item of nestedData) {
                        const referencedData = await this.getData(relationship.schemaId, item.uuid);
                        if (!referencedData) {
                            throw new Error(`Referenced ${field} with uuid ${item.uuid} not found`);
                        }
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Validation error:', error);
            throw error;
        }
    }

    async getChildSchemaData(parentSchemaId, fieldName) {
        try {
            const parentSchema = await this.getSchemaById(parentSchemaId);
            const relationships = await this.getSchemaRelationships(parentSchema);

            if (!relationships[fieldName]) {
                throw new Error(`No child schema found for field ${fieldName}`);
            }

            const childSchemaId = relationships[fieldName].schemaId;
            return await this.getAllData(childSchemaId);
        } catch (error) {
            console.error('Error fetching child schema data:', error);
            throw error;
        }
    }

    async createData(schemaId, data) {
        try {
            const schema = await this.getSchemaById(schemaId);
            await this.validateNestedData(data, schemaId);

            const uuid = uuidv4();
            const timestamp = new Date().toISOString();

            // Process nested references
            const relationships = await this.getSchemaRelationships(schema);
            const processedData = { ...data };
            for (const [field, relationship] of Object.entries(relationships)) {
                if (data[field]) {
                    if (relationship.isArray) {
                        processedData[field] = data[field].map(item => ({
                            uuid: item.uuid,
                            _ref: true
                        }));
                    } else {
                        processedData[field] = {
                            uuid: data[field].uuid,
                            _ref: true
                        };
                    }
                }
            }

            const document = {
                ...processedData,
                uuid,
                createdAt: timestamp,
                lastUpdatedAt: timestamp,
                _schemaId: schemaId
            };

            await firebaseClientActivity.createDocument(schema.schemaName, document, uuid);
            return document;
        } catch (error) {
            console.error('Error creating data:', error);
            throw error;
        }
    }

    async getData(schemaId, uuid) {
        const schema = await this.getSchemaById(schemaId);
        return await firebaseClientActivity.getDocument(schema.schemaName, uuid);
    }

    async updateData(schemaId, uuid, data) {
        try {
            // Get schema definition
            const schema = await this.getSchemaById(schemaId);
            if (!schema) {
                throw new Error('Schema not found');
            }

            // Parse schema and get allowed properties
            const schemaObj = JSON.parse(schema.schema);
            const allowedProperties = Object.keys(schemaObj.properties || {});

            // Validate data against schema properties
            const validData = Object.keys(data).reduce((acc, key) => {
                if (allowedProperties.includes(key)) {
                    acc[key] = data[key];
                }
                return acc;
            }, {});

            // Update the data
            await firebaseClientActivity.updateDocument(schema.schemaName, uuid, validData);
        } catch (error) {
            console.error('Error in updateData:', error);
            throw error;
        }
    }

    async deleteData(schemaId, uuid) {
        const schema = await this.getSchemaById(schemaId);
        await firebaseClientActivity.deleteDocument(schema.schemaName, uuid);
    }

    async getAllData(schemaId) {
        const schema = await this.getSchemaById(schemaId);
        return await firebaseClientActivity.getAllDocuments(schema.schemaName);
    }

    async createTableForSchema(schemaId) {
        try {
            // Get schema details
            const schemas = await firebaseClientActivity.getAllDocuments('schema');
            const schema = schemas.find(s => s.uuid === schemaId);

            if (!schema) {
                throw new Error(`Schema with id ${schemaId} not found`);
            }

            // Initialize collection with metadata
            const timestamp = new Date().toISOString();
            await firebaseClientActivity.createDocument(
                schema.schemaName,
                {
                    _metadata: {
                        schemaId: schema.uuid,
                        schemaName: schema.schemaName,
                        createdAt: timestamp,
                        lastUpdatedAt: timestamp,
                        isInitialized: true
                    }
                },
                '_metadata'
            );

            // Call schema service to update schema with table reference
            await this.updateSchemaWithTableRef(schema.uuid, schema.schemaName);

        } catch (error) {
            console.error('Error creating table for schema:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to create table: ${error.message}`);
            }
            throw new Error('Failed to create table: Unknown error');
        }
    }

    async updateSchemaWithTableRef(schemaId, tableName) {
        try {
            const response = await axios.put('http://localhost:3000/api/updateSchemaTableRef', {
                uuid: schemaId,
                tableRef: tableName
            });
            if (!response.data) {
                throw new Error('Failed to update schema with table reference');
            }
        } catch (error) {
            console.error('Error updating schema with table reference:', error);
            throw error;
        }
    }

    // Add new controller for fetching child data
    async searchChildData(childSchemaId, query) {
        try {
            const allData = await this.getAllData(childSchemaId);
            // Implement basic search across all fields
            return allData.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(query.toLowerCase())
                )
            );
        } catch (error) {
            console.error('Error searching child data:', error);
            throw error;
        }
    }

    async createTable(schemaId) {
        try {
            const schema = await this.schemaService.getSchema({ uuid: schemaId });
            if (!schema) throw new Error('Schema not found');

            const tableRef = `data_${schemaId}`;
            await this.schemaService.updateSchemaTableRef({ uuid: schemaId, tableRef });
            return tableRef;
        } catch (error) {
            throw error;
        }
    }
}

// Export singleton instance
const dataService = DataService.getInstance();

export {
    DataService,
    dataService
};
