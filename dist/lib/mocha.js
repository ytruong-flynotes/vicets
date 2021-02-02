"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
const DEFAULT_BEHAVIOUR = {
    missing: impl_1.MissingItemBehaviour.PROBLEM,
    unexpected: impl_1.UnexpectedItemBehaviour.IGNORE,
    leakActualValuesInError: true,
};
/**
 * Conforms actual to the schema, or to the expected pattern using object();
 *
 * Returns the conformed value if successful.
 *
 * Otherwise throws an assertion Error, with actual, expected and showDiff, compatible with AssertionError, as used by
 * mocha, WebStorm, etc.
 *
 * The 'expected' field on the error will produce a usable diff with the actual value. See documentation on
 * intertwingle() for the shape of 'expected' on the error.
 */
function like(actual, expected, opts = {}) {
    const behaviour = Object.assign({}, DEFAULT_BEHAVIOUR, opts);
    const schema = impl_1.patternItemToSchema(expected);
    const result = impl_1.usingBehaviour(behaviour, () => impl_1.conform(schema, actual));
    if (impl_1.isError(result)) {
        throw new impl_1.ValidationError(actual, result, {
            leakActualValuesInError: behaviour.leakActualValuesInError,
            message: opts.message
        });
    }
    return result;
}
exports.like = like;
//# sourceMappingURL=mocha.js.map