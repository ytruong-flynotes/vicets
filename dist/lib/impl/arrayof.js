"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const types_1 = require("./util/types");
class ArrayOfSchema extends _1.BaseSchema {
    constructor(itemSchema) {
        super();
        this.itemSchema = itemSchema;
    }
    conform(value) {
        if (!(value instanceof Array))
            return _1.failure(`${types_1.typeDescription(value)} was not an Array`);
        const conformed = new Array(value.length);
        let problems = new _1.Problems([]);
        for (let i = 0; i < value.length; i++) {
            const conformedItem = this.itemSchema.conform(value[i]);
            if (conformedItem instanceof _1.Problems)
                problems = problems.merge(conformedItem.prefixPath([i]));
            else
                conformed[i] = conformedItem;
        }
        if (problems.length > 0)
            return problems;
        return conformed;
    }
    toJSON(toJson) {
        return {
            type: "array",
            contains: _1.subSchemaJson(this.itemSchema, toJson),
        };
    }
}
exports.ArrayOfSchema = ArrayOfSchema;
//# sourceMappingURL=arrayof.js.map