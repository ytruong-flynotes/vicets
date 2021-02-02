"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function toJSON(value) {
    if (Array.isArray(value))
        return value.map(v => toJSON(v));
    if (typeof value === "object")
        return typeof value['toJSON'] === 'function' ? value.toJSON() : value;
    return value;
}
exports.toJSON = toJSON;
//# sourceMappingURL=json.js.map