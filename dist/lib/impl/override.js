"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const types_1 = require("./util/types");
class OverrideSchema extends _1.BaseSchema {
    constructor(subschema, overrides) {
        super();
        this.subschema = subschema;
        this.overrides = overrides;
    }
    conform(value) {
        const result = this.subschema.conform(value);
        return result instanceof _1.Problems
            ? this.failure(value, result)
            : result;
    }
    failure(value, original) {
        const f = this.overrides.failure;
        if (!f) {
            return original;
        }
        else if (typeof f === 'string') {
            return _1.failure(f);
        }
        else if (f instanceof Function) {
            return f(value);
        }
        else {
            throw new Error(`Not implemented for ${types_1.typeDescription(f)}`);
        }
    }
    toJSON(toJson) {
        return _1.subSchemaJson(this.subschema, toJson);
    }
}
exports.OverrideSchema = OverrideSchema;
//# sourceMappingURL=override.js.map