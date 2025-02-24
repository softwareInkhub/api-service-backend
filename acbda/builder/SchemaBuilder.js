export class SchemaBuilder {
    constructor(uuid, schemaName) {
        this.uuid = uuid;
        this.schemaName = schemaName;
        this.createdAt = new Date().toISOString();
        this.lastUpdatedAt = this.createdAt;
        this.schemaDefinition = {
            type: 'object',
            properties: {
                'schema-id': {
                    type: 'string',
                    description: 'Reference to the schema definition',
                    readOnly: true,
                    default: this.uuid
                }
            },
            required: ['schema-id']
        };
    }

    addProperties(properties) {
        // Preserve schema-id while adding new properties
        this.schemaDefinition.properties = {
            'schema-id': this.schemaDefinition.properties['schema-id'],
            ...properties
        };
        return this;
    }

    addRequired(fields) {
        // Ensure schema-id remains in required fields
        const uniqueRequired = new Set(['schema-id', ...fields]);
        this.schemaDefinition.required = Array.from(uniqueRequired);
        return this;
    }

    setAdditionalProperties(allowed) {
        this.schemaDefinition.additionalProperties = allowed;
        return this;
    }

    build() {
        return {
            uuid: this.uuid,
            schemaName: this.schemaName,
            schema: JSON.stringify(this.schemaDefinition),
            createdAt: this.createdAt,
            lastUpdatedAt: this.lastUpdatedAt
        };
    }

    static fromExisting(existingSchema) {
        const builder = new SchemaBuilder(existingSchema.uuid, existingSchema.schemaName);
        const parsedSchema = JSON.parse(existingSchema.schema);

        // Ensure schema-id is preserved
        builder.schemaDefinition = {
            ...parsedSchema,
            properties: {
                'schema-id': {
                    type: 'string',
                    description: 'Reference to the schema definition',
                    readOnly: true,
                    default: existingSchema.uuid
                },
                ...parsedSchema.properties
            },
            required: Array.from(new Set(['schema-id', ...(parsedSchema.required || [])]))
        };

        builder.createdAt = existingSchema.createdAt;
        builder.lastUpdatedAt = new Date().toISOString();
        return builder;
    }

    static validateSchema(schemaData) {
        const parsedSchema = typeof schemaData === 'string'
            ? JSON.parse(schemaData)
            : schemaData;

        if (!parsedSchema.type || parsedSchema.type !== 'object') {
            throw new Error('Schema must be of type "object"');
        }

        // Ensure schema-id is not manually added/modified
        if (parsedSchema.properties && 'schema-id' in parsedSchema.properties) {
            delete parsedSchema.properties['schema-id'];
        }

        if (!parsedSchema.properties) {
            parsedSchema.properties = {};
        }

        return parsedSchema;
    }
}
