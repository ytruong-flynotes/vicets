"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isPrimitive(value) {
    return (typeof value !== 'object' && typeof value !== 'function') || value === null;
}
exports.isPrimitive = isPrimitive;
function unsafeCast(x) {
    return x;
}
exports.unsafeCast = unsafeCast;
function typeDescription(x) {
    if (x === null)
        return 'null';
    let t = typeof x;
    if (t !== 'object')
        return t;
    const p = Object.getPrototypeOf(x);
    if (p !== Object.prototype)
        return p.constructor.name;
    return t;
}
exports.typeDescription = typeDescription;
//# sourceMappingURL=types.js.map