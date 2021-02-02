"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const json_1 = require("./util/json");
class DefaultValueSchema extends _1.BaseSchema {
    constructor(value, subschema) {
        super();
        this.value = value;
        this.subschema = subschema;
    }
    conform(value) {
        if (value === undefined)
            value = this.value();
        return this.subschema.conform(value);
    }
    toJSON(toJson) {
        return Object.assign({}, _1.subSchemaJson(this.subschema, toJson), { default: json_1.toJSON(this.value()) });
    }
}
exports.DefaultValueSchema = DefaultValueSchema;
//# sourceMappingURL=defaultValue.js.map