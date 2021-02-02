"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
class SelectSchema extends _1.BaseSchema {
    constructor(path, subschema) {
        super();
        this.path = path;
        this.subschema = subschema;
    }
    ;
    conform(value) {
        if (typeof value !== 'object')
            return _1.failure("expected an object");
        let target = value;
        let atPath = [];
        for (const key of this.path) {
            atPath.push(key);
            if (!(key in target))
                return _1.failure("no value", atPath);
            target = target[key];
        }
        const result = this.subschema.conform(target);
        return result instanceof _1.Problems
            ? result.prefixPath(this.path)
            : result;
    }
    toJSON() {
        throw new Error("Not implemented");
    }
}
exports.SelectSchema = SelectSchema;
//# sourceMappingURL=select.js.map