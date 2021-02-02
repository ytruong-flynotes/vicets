"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const magic_1 = require("../util/magic");
function objectEntries(object) {
    const result = [];
    for (const k of Object.keys(object)) {
        const s = object[k];
        if (typeof s['conform'] !== 'function')
            throw new Error(`Not a schema ${s}`);
        else
            result.push([k, s]);
    }
    return result;
}
exports.objectEntries = objectEntries;
function patternItemToSchema(item) {
    if (typeof item !== 'object')
        return new __1.EqualsSchema(item);
    if (item instanceof Array)
        return new __1.TupleSchema(item.map(v => patternItemToSchema(v)));
    if (typeof item === 'undefined')
        return new __1.EqualsSchema(undefined);
    if (item === null)
        return new __1.EqualsSchema(null);
    if (typeof item['conform'] === 'function')
        return item;
    return new ObjectSchema(item);
}
exports.patternItemToSchema = patternItemToSchema;
function patternToSchemas(pattern) {
    const result = {};
    for (const k of Object.keys(pattern)) {
        const s = pattern[k];
        result[k] = patternItemToSchema(s);
    }
    return result;
}
exports.patternToSchemas = patternToSchemas;
class ObjectStrategies {
    constructor(result) {
        this.result = result;
    }
    set(k, v) {
        magic_1.addGetter(this.result, k, () => v);
        return this;
    }
    delete(k) {
        return delete this.result[k];
    }
    has(k) {
        return k in this.result;
    }
    get(k) {
        return this.result[k];
    }
    keys() {
        return Object.keys(this.result);
    }
}
exports.ObjectStrategies = ObjectStrategies;
class ObjectSchema extends __1.BaseSchema {
    constructor(pattern) {
        super();
        this.pattern = pattern;
        this.fieldSchemaArray = objectEntries(patternToSchemas(pattern));
    }
    conform(value) {
        if (value === undefined || value === null)
            return __1.failure('no value');
        if (typeof value !== 'object')
            return __1.failure(`expected an object but got ${typeof value}`);
        const instance = magic_1.copyGetters(value);
        return this.conformInPlace(instance);
    }
    /**
     * Required to allow @hasSchema to conform 'this'
     */
    conformInPlace(instance) {
        const problems = __1.conformInPlace(new ObjectStrategies(instance), this.fieldSchemaArray);
        return problems ? problems : instance;
    }
    intersect(other) {
        const mergedSchemas = magic_1.merge(this.pattern, other.pattern, (a, b) => a.and(b));
        return new ObjectSchema(mergedSchemas);
    }
    toJSON(toJson) {
        const properties = this.fieldSchemaArray.reduce((result, [k, subSchema]) => {
            result[k] = __1.subSchemaJson(subSchema, toJson);
            return result;
        }, {});
        const required = this.fieldSchemaArray
            .filter(([k, schema]) => !__1.isOptional(schema))
            .map(([k]) => k);
        return {
            type: "object",
            properties: properties,
            required: required,
        };
    }
}
exports.ObjectSchema = ObjectSchema;
//# sourceMappingURL=obj.js.map