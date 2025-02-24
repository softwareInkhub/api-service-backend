/**
 * @typedef {Object} Schema
 * @property {string} uuid
 * @property {string} schemaName
 * @property {string} schema
 * @property {string} [tableRef]
 * @property {boolean} [isTableInitialized]
 * @property {string} createdAt
 * @property {string} lastUpdatedAt
 */

/**
 * @typedef {Object} SchemaProperty
 * @property {string} type
 * @property {string} [description]
 * @property {string} [format]
 * @property {number} [minimum]
 * @property {number} [maximum]
 * @property {string} [pattern]
 * @property {Array<*>} [enum]
 * @property {SchemaProperty} [items]
 * @property {Object<string, SchemaProperty>} [properties]
 * @property {Array<string>} [required]
 * @property {boolean} [readOnly]
 * @property {*} [default]
 */

/**
 * @typedef {Object} SchemaDefinition
 * @property {string} type
 * @property {Object<string, SchemaProperty>} properties
 * @property {Array<string>} [required]
 * @property {boolean} [additionalProperties]
 */

module.exports = {}; 