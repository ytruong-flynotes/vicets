"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const types_1 = require("./util/types");
class EqualsSchema extends _1.BaseSchema {
    constructor(expected) {
        super();
        this.expected = expected;
    }
    conform(value) {
        if (value !== this.expected)
            return _1.failure(`expected "${this.expected}" but got ${types_1.typeDescription(value)}: ${JSON.stringify(value)}`);
        return value;
    }
    toJSON() {
        return { const: this.expected };
    }
}
exports.EqualsSchema = EqualsSchema;
//# sourceMappingURL=eq.js.map