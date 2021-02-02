"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const types_1 = require("./util/types");
class IsInstanceSchema extends _1.BaseSchema {
    constructor(c) {
        super();
        this.c = c;
    }
    conform(value) {
        return value instanceof this.c ? value : _1.failure(`expected ${this.c.name} but got ${types_1.typeDescription(value)}`);
    }
    /**
     * This isn't really suitable for json schema,
     * which doesn't have the concept of a type
     */
    toJSON() {
        return {
            type: "object",
            description: `Instance of ${this.c.name}`,
            additionalProperties: true,
        };
    }
}
exports.IsInstanceSchema = IsInstanceSchema;
//# sourceMappingURL=isinstance.js.map