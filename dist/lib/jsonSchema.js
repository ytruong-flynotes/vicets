"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
const impl_1 = require("./impl");
const maps_1 = require("./impl/util/maps");
function subSchemaJson(schema, toJson) {
    toJson = toJson || ((s) => s.toJSON());
    return Array.isArray(schema)
        ? schema.map(toJson)
        : toJson(schema);
}
exports.subSchemaJson = subSchemaJson;
function refLookup(defs, path = "#/definitions") {
    return Object.entries(defs)
        .reduce((result, [k, schemaOrDefs]) => {
        const itemPath = `${path}/${k}`;
        if (impl_1.isSchema(schemaOrDefs)) {
            if (schemaOrDefs instanceof data_1.DataSchema)
                schemaOrDefs = schemaOrDefs.subSchema;
            result.set(schemaOrDefs, { $ref: itemPath });
            return result;
        }
        else {
            const lookup = refLookup(schemaOrDefs, itemPath);
            return maps_1.merge(result, lookup, () => {
                throw new Error('Should never happen');
            });
        }
    }, new Map());
}
function definitionsJson(defs, toJson) {
    return Object.entries(defs)
        .reduce((result, [k, schemaOrDefs]) => {
        if (impl_1.isSchema(schemaOrDefs))
            result[k] = schemaOrDefs.toJSON(toJson);
        else
            result[k] = definitionsJson(schemaOrDefs, toJson);
        return result;
    }, {});
}
function jsonSchema(opts) {
    const lookup = refLookup(opts.definitions);
    function subschema(schema) {
        if (schema instanceof data_1.DataSchema)
            schema = schema.subSchema;
        const ref = lookup.get(schema);
        const result = ref || schema.toJSON(subschema);
        return result;
    }
    const definitions = definitionsJson(opts.definitions, subschema);
    return Object.assign({}, (opts.id && { id: opts.id }), { $schema: "http://json-schema.org/draft-07/schema#", definitions });
}
exports.jsonSchema = jsonSchema;
//# sourceMappingURL=jsonSchema.js.map