"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function addGetter(obj, k, getter) {
    Object.defineProperty(obj, k, {
        enumerable: true,
        configurable: true,
        get: getter
    });
    return obj;
}
exports.addGetter = addGetter;
function mapGetters(original, mapper) {
    return Object
        .keys(original)
        .reduce((mapped, k) => addGetter(mapped, k, mapper(original, mapped, k)), {});
}
exports.mapGetters = mapGetters;
function copyGetters(original) {
    return Object
        .keys(original)
        .reduce((mapped, k) => addGetter(mapped, k, () => original[k]), {});
}
exports.copyGetters = copyGetters;
function merge(a, b, conflictFn) {
    const result = {};
    for (const k in a) {
        result[k.toString()] = a[k];
    }
    for (const k in b) {
        if (k in result) {
            const kk = k;
            result[k.toString()] = conflictFn(a[kk], b[kk]);
        }
        else {
            result[k.toString()] = b[k];
        }
    }
    return result;
}
exports.merge = merge;
//# sourceMappingURL=magic.js.map