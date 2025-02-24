export class DataBuilder {
    constructor(schema, uuid) {
        this.schema = schema;
        this.uuid = uuid;
        this.createdAt = new Date().toISOString();
        this.lastUpdatedAt = this.createdAt;
        this.data = {};
    }

    setData(data) {
        // Validate data against schema
        const schemaDefinition = JSON.parse(this.schema.schema);
        this.validateDataAgainstSchema(data, schemaDefinition);
        
        // Add schema-id
        this.data = {
            ...data,
            'schema-id': this.schema.uuid
        };
        return this;
    }

    validateDataAgainstSchema(data, schema) {
        // Basic validation - can be enhanced based on requirements
        const requiredFields = schema.required || [];
        for (const field of requiredFields) {
            if (!(field in data) && field !== 'schema-id') {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate data types
        for (const [key, value] of Object.entries(data)) {
            const propertySchema = schema.properties[key];
            if (!propertySchema) {
                if (!schema.additionalProperties) {
                    throw new Error(`Unknown field: ${key}`);
                }
                continue;
            }

            // Type validation
            if (!this.validateType(value, propertySchema.type)) {
                throw new Error(`Invalid type for field ${key}. Expected ${propertySchema.type}`);
            }
        }
    }

    validateType(value, expectedType) {
        switch (expectedType) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number';
            case 'boolean':
                return typeof value === 'boolean';
            case 'object':
                return typeof value === 'object' && !Array.isArray(value);
            case 'array':
                return Array.isArray(value);
            default:
                return true;
        }
    }

    build() {
        return {
            uuid: this.uuid,
            data: this.data,
            schemaId: this.schema.uuid,
            createdAt: this.createdAt,
            lastUpdatedAt: this.lastUpdatedAt
        };
    }
}
