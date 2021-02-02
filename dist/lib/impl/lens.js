"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
function setAtPath(obj, path, value) {
    if (path.length === 1) {
        obj[path[0]] = value;
        return obj;
    }
    const key = path[0];
    setAtPath(obj[key], path.slice(1), value);
    return obj;
}
exports.setAtPath = setAtPath;
class LensSchema extends _1.BaseSchema {
    constructor(path, subschema) {
        super();
        this.path = path;
        this.subschema = new _1.SelectSchema(path, subschema);
    }
    conform(value) {
        if (typeof value !== 'object')
            return _1.failure("expected an object");
        const conformed = this.subschema.conform(value);
        if (conformed instanceof _1.Problems)
            return conformed;
        return setAtPath(value, this.path, conformed);
    }
    toJSON() {
        throw new Error("Not implemented");
    }
}
exports.LensSchema = LensSchema;
var LensBehaviour;
(function (LensBehaviour) {
    LensBehaviour["MODIFY_IN_PLACE"] = "modify-in-place";
    // Deep clone is not implemented.
    // Just a marker enum to flag the behaviour
})(LensBehaviour = exports.LensBehaviour || (exports.LensBehaviour = {}));
//# sourceMappingURL=lens.js.map