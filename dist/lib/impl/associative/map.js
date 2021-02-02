"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const types_1 = require("../util/types");
class MapSchema extends __1.BaseSchema {
    constructor(subSchema) {
        super();
        this.subSchema = subSchema;
    }
    conform(value) {
        if (value === undefined || value === null)
            return __1.failure('no value');
        if (!(value instanceof Map || typeof value === 'object'))
            return __1.failure(`expected a Map or object but got ${types_1.typeDescription(value)}`);
        const instance = new Map();
        const kvs = value instanceof Map ? value.entries() : Object.entries(value);
        for (let [k, v] of kvs) {
            instance.set(k, v);
        }
        const problems = __1.conformInPlace(instance, this.subSchema.fieldSchemaArray);
        return problems ? problems : instance;
    }
    toJSON(toJson) {
        return __1.subSchemaJson(this.subSchema, toJson);
    }
}
exports.MapSchema = MapSchema;
//# sourceMappingURL=map.js.map