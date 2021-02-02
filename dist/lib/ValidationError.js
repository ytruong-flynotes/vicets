"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
const types_1 = require("./impl/util/types");
function pathsEq(a, b) {
    return a.length === b.length
        && a.every((v, i) => v === b[i]);
}
exports.pathsEq = pathsEq;
function pathStartsWith(path, startsWith) {
    return path.length >= startsWith.length
        && startsWith.every((v, i) => v === path[i]);
}
exports.pathStartsWith = pathStartsWith;
function intertwingledValue(actual, problems, path) {
    if (types_1.isPrimitive(actual))
        return actual;
    // Arrays or objects
    const associative = impl_1.wrapAssociative(actual);
    const keys = new Set(associative.keys());
    const missingKeys = problems.problems
        .filter(p => 
    // problems for direct children of path (but not ancestors)
    p.path.length === path.length + 1
        && pathStartsWith(p.path, path)
        // ...that are not in actual
        && !keys.has(p.path[-1]))
        .map(p => p.path[p.path.length - 1]);
    return [...keys, ...missingKeys]
        .reduce((result, k) => {
        result[k] = intertwingle(actual[k], problems, [...path, k]);
        return result;
    }, impl_1.empty(actual));
}
/**
 * Returns an object in the same shape as actual, but with invalid values replaced with an error report.
 *
 * e.g.
 *
 * const actual = {right: 'right', wrong:'wrong'};
 * const problems = [{path: ['wrong'], message: 'error message'};
 * intertwingle(actual, problems);
 *
 * will return
 *
 * {right: 'right', wrong: {value: 'wrong', errors: ['error message']}}
 *
 * This is suitable for a structural diff with the actual value, where only
 * problem fields will be mismatches
 */
function intertwingle(actual, problems, path = []) {
    const myProblems = problems.problems
        .filter(p => pathsEq(path, p.path))
        .map(p => p.message);
    const intertwingled = intertwingledValue(actual, problems, path);
    return myProblems.length === 0
        ? intertwingled
        : myProblems.length === 1
            ? myProblems[0]
            : myProblems;
}
exports.intertwingle = intertwingle;
class ValidationError extends Error {
    constructor(actual, problems, { message = 'Validation failed', leakActualValuesInError = false, } = {}) {
        super(`${message}:\n${problems}${leakActualValuesInError ? `\nactual:${JSON.stringify(actual, null, 2)}\n` : ''}`);
        this.problems = problems;
        if (leakActualValuesInError) {
            this.actual = actual;
            this.expected = intertwingle(actual, problems, []);
            showDiff: true;
        }
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=ValidationError.js.map