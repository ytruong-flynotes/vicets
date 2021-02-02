"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
function validate(schema, value, opts = {}) {
    const conformed = conform(schema, value, opts);
    if (conformed instanceof impl_1.Problems) {
        throw new impl_1.ValidationError(value, conformed, opts);
    }
    return conformed;
}
exports.validate = validate;
function conform(schema, value, opts = {}) {
    if (!schema)
        throw new Error("No schema provided");
    return impl_1.usingBehaviour(opts, () => schema.conform(value));
}
exports.conform = conform;
//# sourceMappingURL=helpers.js.map