const validateAndEnrichSchema = (schemaData, uuid) => {
    try {
        const parsedSchema = typeof schemaData.schema === 'string' 
            ? JSON.parse(schemaData.schema) 
            : schemaData.schema;

        // Ensure schema has type and properties
        if (!parsedSchema.type || parsedSchema.type !== 'object') {
            throw new Error('Schema must be of type "object"');
        }

        if (!parsedSchema.properties) {
            parsedSchema.properties = {};
        }

        // Add schema-id field that references the schema's UUID
        parsedSchema.properties['schema-id'] = {
            type: "string",
            description: "Reference to the schema definition",
            readOnly: true,
            default: uuid
        };

        // Add schema-id to required fields
        if (!parsedSchema.required) {
            parsedSchema.required = [];
        }
        if (!parsedSchema.required.includes('schema-id')) {
            parsedSchema.required.push('schema-id');
        }

        return {
            ...schemaData,
            schema: JSON.stringify(parsedSchema)
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Invalid schema: ${error.message}`);
        }
        throw new Error('Invalid schema: Unknown error occurred');
    }
}; 

module.exports = {
    validateAndEnrichSchema
}; 