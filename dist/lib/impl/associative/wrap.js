"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
function wrapAssociative(actual) {
    if (actual instanceof Array)
        return new __1.TupleStrategies(actual);
    if (typeof actual === 'object')
        return new __1.ObjectStrategies(actual);
    throw new Error(`Not supported: ${typeof actual}`);
}
exports.wrapAssociative = wrapAssociative;
function empty(actual) {
    if (actual instanceof Array)
        return [];
    if (typeof actual === 'object')
        return {};
    throw new Error(`Not supported: ${typeof actual}`);
}
exports.empty = empty;
//# sourceMappingURL=wrap.js.map