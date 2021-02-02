"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const types_1 = require("./util/types");
class LookupSchema extends _1.BaseSchema {
    constructor(lookup) {
        super();
        this.lookup = lookup;
    }
    conform(value) {
        if (typeof value !== 'string')
            return _1.failure(`expected a string but got ${types_1.typeDescription(value)}`);
        if (value in this.lookup)
            return this.lookup[value];
        return _1.failure(`expected one of [${Object.keys(this.lookup).map((k) => JSON.stringify(k)).join(', ')}]`);
    }
    toJSON() {
        return {
            type: "string",
            enum: Object.keys(this.lookup)
        };
    }
}
exports.LookupSchema = LookupSchema;
//# sourceMappingURL=lookup.js.map