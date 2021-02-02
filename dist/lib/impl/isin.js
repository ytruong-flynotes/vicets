"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const json_1 = require("./util/json");
class InSchema extends _1.BaseSchema {
    constructor(values) {
        super();
        if (values.length === 0)
            throw new Error('At least one value is required');
        this.values = new Set(values);
    }
    conform(value) {
        if (!this.values.has(value))
            return _1.failure(`expected one of [${Array.from(this.values).join(', ')}]`);
        return value;
    }
    toJSON() {
        const values = [...this.values].map(v => json_1.toJSON(v));
        const types = new Set(values.map(v => typeof v));
        return {
            type: types.size === 1 ? types.values().next().value : [...types],
            enum: values
        };
    }
}
exports.InSchema = InSchema;
//# sourceMappingURL=isin.js.map