"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const types_1 = require("./util/types");
class SetOfSchema extends _1.BaseSchema {
    constructor(itemSchema) {
        super();
        this.itemSchema = itemSchema;
    }
    conform(value) {
        if (!(value instanceof Set || value instanceof Array))
            return _1.failure(`${types_1.typeDescription(value)} was not an Array or a Set`);
        const entries = value instanceof Set ? value.entries() : value.map((v, i) => [i, v]);
        const conformed = new Set();
        let problems = new _1.Problems([]);
        for (const [k, v] of entries) {
            const c = this.itemSchema.conform(v);
            if (c instanceof _1.Problems)
                problems = problems.merge(c.prefixPath([k]));
            else
                conformed.add(c);
        }
        if (problems.length > 0)
            return problems;
        return conformed;
    }
    toJSON(toJson) {
        return {
            type: "array",
            items: _1.subSchemaJson(this.itemSchema, toJson)
        };
    }
}
exports.SetOfSchema = SetOfSchema;
//# sourceMappingURL=setof.js.map