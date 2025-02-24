/*
DOCUMENTATION
ClientServiceActivity

Summary: 
Create, edit, delete Client for external APIs

Method details:
CLient single CRUD operations
Client Bulk operations:
    1. GetAll()
    2.  


Created By: Mohit 
Date:

*/

import { v4 as uuidv4 } from 'uuid';
import { firebaseClientActivity } from './firebaseClientActivity.js';
import { SchemaBuilder } from '../../builder/SchemaBuilder.js';

class SchemaService {
    constructor() {
        this.COLLECTION_NAME = 'schema';
    }

    static getInstance() {
        if (!SchemaService.instance) {
            SchemaService.instance = new SchemaService();
        }
        return SchemaService.instance;
    }

    async createSchema(data) {
        const uuid = uuidv4();
        
        try {
            // Validate the incoming schema
            const validatedSchema = SchemaBuilder.validateSchema(data.schema);
            
            // Create a new schema using the builder
            const schemaBuilder = new SchemaBuilder(uuid, data.schemaName)
                .addProperties(validatedSchema.properties);

            if (validatedSchema.required) {
                schemaBuilder.addRequired(validatedSchema.required);
            }

            if (validatedSchema.additionalProperties !== undefined) {
                schemaBuilder.setAdditionalProperties(validatedSchema.additionalProperties);
            }

            const schema = schemaBuilder.build();

            await firebaseClientActivity.createDocument(this.COLLECTION_NAME, schema, uuid);
            return schema;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create schema: ${error.message}`);
            }
            throw new Error('Failed to create schema: Unknown error');
        }
    }

    async getSchema(data) {
        const doc = await firebaseClientActivity.getDocument(this.COLLECTION_NAME, data.uuid);
        if (!doc) return null;
        return doc;
    }

    async updateSchema(data) {
        const { uuid, updateData } = data;
        
        try {
            const existingSchema = await this.getSchema({ uuid });
            if (!existingSchema) {
                throw new Error('Schema not found');
            }

            // If schema is being updated, validate it
            if (updateData.schema) {
                const validatedSchema = SchemaBuilder.validateSchema(updateData.schema);
                
                // Update using builder
                const schemaBuilder = SchemaBuilder.fromExisting(existingSchema)
                    .addProperties(validatedSchema.properties);

                if (validatedSchema.required) {
                    schemaBuilder.addRequired(validatedSchema.required);
                }

                if (validatedSchema.additionalProperties !== undefined) {
                    schemaBuilder.setAdditionalProperties(validatedSchema.additionalProperties);
                }

                const updatedSchema = schemaBuilder.build();
                await firebaseClientActivity.updateDocument(this.COLLECTION_NAME, uuid, updatedSchema);
                return updatedSchema;
            }

            // If only metadata is being updated
            const updatedSchema = {
                ...existingSchema,
                ...updateData,
                lastUpdatedAt: new Date().toISOString()
            };

            await firebaseClientActivity.updateDocument(this.COLLECTION_NAME, uuid, updatedSchema);
            return updatedSchema;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update schema: ${error.message}`);
            }
            throw new Error('Failed to update schema: Unknown error');
        }
    }

    async deleteSchema(data) {
        await firebaseClientActivity.deleteDocument(this.COLLECTION_NAME, data.uuid);
    }

    async getAllSchemas() {
        console.log('Inside getAllSchemas');
        const docs = await firebaseClientActivity.getAllDocuments(this.COLLECTION_NAME);
        return docs;
    }

    async updateSchemaTableRef(data) {
        try {
            const { uuid, tableRef } = data;
            const updateData = {
                tableRef,
                lastUpdatedAt: new Date().toISOString(),
                isTableInitialized: true
            };

            await firebaseClientActivity.updateDocument(this.COLLECTION_NAME, uuid, updateData);
            const updated = await this.getSchema({ uuid });
            if (!updated) throw new Error('Failed to retrieve updated schema');
            return updated;
        } catch (error) {
            console.error('Error updating schema table reference:', error);
            throw error;
        }
    }
}

SchemaService.instance = null;
const schemaService = SchemaService.getInstance();

// Controller functions
const createSchema = async (req, res) => {
    try {
        console.log('req.body: ' + req.body);
        const clientSchema = await schemaService.createSchema(req.body);
        res.status(201).json(clientSchema);
    } catch (error) {
        console.error('Error in createClientSchema controller:', error);
        res.status(500).json({ error: 'Failed to create client schema' });
    }
};

const getSchema = async (req, res) => {
    try {
        const { uuid } = req.body; // Get uuid from request body
        console.log('uuid: ' + uuid);
        console.log('req.body: ' + JSON.stringify(req.body));

        // Validate the uuid
        if (!uuid || typeof uuid !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing uuid' });
        }

        // Proceed with fetching the client schema using the uuid
        const clientSchema = await schemaService.getSchema({ uuid });
        
        if (!clientSchema) {
            return res.status(404).json({ error: 'Client schema not found' });
        }
        
        res.status(200).json(clientSchema);
    } catch (error) {
        console.error('Error in getClientSchema controller:', error);
        res.status(500).json({ error: 'Failed to get client schema' });
    }
};

const updateSchema = async (req, res) => {
    try {
        const { uuid, ...updateData } = req.body; // Get uuid and update data from request body
        const clientSchema = await schemaService.updateSchema({ uuid, updateData });
        res.status(200).json(clientSchema);
    } catch (error) {
        console.error('Error in updateClientSchema controller:', error);
        res.status(500).json({ error: 'Failed to update client schema' });
    }
};

const deleteSchema = async (req, res) => {
    try {
        const { uuid } = req.body; // Get uuid from request body
        await schemaService.deleteSchema({ uuid });
        res.status(204).send();
    } catch (error) {
        console.error('Error in deleteClientSchema controller:', error);
        res.status(500).json({ error: 'Failed to delete client schema' });
    }
};

const getAllSchemas = async (req, res) => {
    try {
        const schemas = await schemaService.getAllSchemas();
        res.status(200).json(schemas);
    } catch (error) {
        console.error('Error in getAllSchemas controller:', error);
        res.status(500).json({ error: 'Failed to retrieve schemas' });
    }
};

const updateSchemaTableRef = async (req, res) => {
    try {
        const { uuid, tableRef } = req.body;
        if (!uuid || !tableRef) {
            return res.status(400).json({ error: 'Schema ID and table reference are required' });
        }

        const updatedSchema = await schemaService.updateSchemaTableRef({ uuid, tableRef });
        res.status(200).json(updatedSchema);
    } catch (error) {
        console.error('Error in updateSchemaTableRef controller:', error);
        res.status(500).json({ error: 'Failed to update schema table reference' });
    }
};

export {
    SchemaService,
    schemaService,
    createSchema,
    getSchema,
    updateSchema,
    deleteSchema,
    getAllSchemas,
    updateSchemaTableRef
};
