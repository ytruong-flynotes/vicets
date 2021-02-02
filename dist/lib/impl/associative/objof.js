"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
class ObjOfSchema extends __1.BaseSchema {
    constructor(valueSchema) {
        super();
        this.valueSchema = valueSchema;
    }
    conform(value) {
        if (value === undefined || value === null)
            return __1.failure('no value');
        if (typeof value !== 'object')
            return __1.failure(`expected an object but got ${typeof value}`);
        const itemSchemas = Object.keys(value).map(k => [k, this.valueSchema]);
        const instance = {};
        Object.assign(instance, value);
        const problems = __1.conformInPlace(new __1.ObjectStrategies(instance), itemSchemas);
        return problems ? problems : instance;
    }
    toJSON(toJson) {
        return {
            type: "object",
            patternProperties: {
                ".*": __1.subSchemaJson(this.valueSchema, toJson)
            }
        };
    }
}
exports.ObjOfSchema = ObjOfSchema;
//# sourceMappingURL=objof.js.map