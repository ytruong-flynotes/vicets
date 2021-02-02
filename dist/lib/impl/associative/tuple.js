"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const types_1 = require("../util/types");
class TupleStrategies {
    constructor(resultIn) {
        this.resultIn = resultIn;
        this.deleted = [];
    }
    get result() {
        return Array.from(this.keys()).filter(n => this.deleted.indexOf(n) < 0).map(n => this.resultIn[n]);
    }
    set(k, v) {
        this.resultIn[k] = v;
        return this;
    }
    has(k) {
        return k < this.resultIn.length;
    }
    get(k) {
        return this.resultIn[k];
    }
    delete(k) {
        if (this.resultIn.length <= k)
            return false;
        this.deleted.push(k);
        return true;
    }
    keys() {
        return Array(this.resultIn.length).keys();
    }
}
exports.TupleStrategies = TupleStrategies;
class TupleSchema extends __1.BaseSchema {
    constructor(schemas) {
        super();
        this.itemSchemas = schemas.map((v, i) => [i, v]);
    }
    conform(value) {
        if (value === undefined || value === null)
            return __1.failure('no value');
        if (!(value instanceof Array))
            return __1.failure(`expected an array but got ${types_1.typeDescription(value)}`);
        const instance = [];
        for (let i = 0; i < value.length; i++) {
            instance[i] = value[i];
        }
        const result = new TupleStrategies(instance);
        const problems = __1.conformInPlace(result, this.itemSchemas);
        return problems ? problems : result.result;
    }
    toJSON(toJson) {
        return {
            type: "array",
            items: __1.subSchemaJson(this.itemSchemas.map(([k, v]) => v), toJson)
        };
    }
}
exports.TupleSchema = TupleSchema;
//# sourceMappingURL=tuple.js.map