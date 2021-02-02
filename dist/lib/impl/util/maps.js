"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mapKeyValue(f, m) {
    const result = new Map();
    for (const [k, v] of m.entries()) {
        const [nk, nv] = f(k, v);
        result.set(nk, nv);
    }
    return result;
}
exports.mapKeyValue = mapKeyValue;
function mapValues(f, m) {
    return mapKeyValue((k, v) => [k, f(v)], m);
}
exports.mapValues = mapValues;
function merge(a, b, conflictFn) {
    const result = new Map();
    for (const [k, v] of a.entries()) {
        result.set(k, v);
    }
    for (const [k, v] of b.entries()) {
        if (result.has(k)) {
            result.set(k, conflictFn(a.get(k), v));
        }
        else {
            result.set(k, v);
        }
    }
    return result;
}
exports.merge = merge;
function toMap(x) {
    const result = new Map();
    for (let [k, v] of Object.entries(x)) {
        result.set(k, v);
    }
    return result;
}
exports.toMap = toMap;
//# sourceMappingURL=maps.js.map