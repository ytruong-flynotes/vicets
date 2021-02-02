"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
class DeferredSchema extends _1.BaseSchema {
    constructor(deferred) {
        super();
        this.deferred = deferred;
    }
    get subschema() {
        this._subschema = this.deferred();
        return this._subschema;
    }
    conform(value) {
        return this.subschema.conform(value);
    }
    toJSON(toJson) {
        return _1.subSchemaJson(this.subschema, toJson);
    }
}
exports.DeferredSchema = DeferredSchema;
//# sourceMappingURL=deferred.js.map