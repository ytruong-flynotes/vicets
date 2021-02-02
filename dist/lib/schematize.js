"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
function schematizeEntries(object) {
    const fixed = {};
    for (const [k, v] of Object.entries(object)) {
        fixed[k] = schematize(v);
    }
    return fixed;
}
exports.schematizeEntries = schematizeEntries;
function schematize(x) {
    switch (typeof x) {
        case "string":
        case "number":
        case "boolean":
            return new impl_1.EqualsSchema(x);
        case "object":
            const obj = x;
            if ('conform' in obj && typeof x['conform'] === "function")
                return x;
            else if (Object.getPrototypeOf(x) === Object.prototype)
                return new impl_1.ObjectSchema(schematizeEntries(obj));
            else
                throw Error(`Cannot build schema from non-plain object ${Object.getPrototypeOf(x).name}`);
        default:
            throw Error(`Cannot build schema from ${typeof x}: ${x}`);
    }
}
exports.schematize = schematize;
//# sourceMappingURL=schematize.js.map