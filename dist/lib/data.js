"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
const core_1 = require("./impl/core");
const types_1 = require("./impl/util/types");
function data(c) {
    // suspendValidation is required to allow calling parent constructor
    const objectWithDefaults = impl_1.suspendValidation(() => new c());
    for (const [k, v] of Object.entries(objectWithDefaults)) {
        if (!(impl_1.isSchema(v) || types_1.isPrimitive(v)))
            throw new Error(`Field '${k}' on ${c.name} is neither a schema nor a primitive value`);
    }
    const schema = new impl_1.ObjectSchema(impl_1.schematizeEntries(objectWithDefaults));
    return impl_1.hasSchema(schema)(c);
}
exports.data = data;
function intersect(a, b) {
    const schema = impl_1.schemaOf(a).intersect(impl_1.schemaOf(b));
    let Intersection = class Intersection {
    };
    Intersection = __decorate([
        impl_1.hasSchema(schema)
    ], Intersection);
    for (let id in a.prototype) {
        Intersection.prototype[id] = a.prototype[id];
    }
    for (let id in b.prototype) {
        if (!Intersection.prototype.hasOwnProperty(id)) {
            Intersection.prototype[id] = b.prototype[id];
        }
    }
    return Intersection;
}
exports.intersect = intersect;
function makeInstance(c, obj) {
    return Object.assign(Object.create(c.prototype), obj);
}
exports.makeInstance = makeInstance;
function conformAs(c, obj) {
    const result = impl_1.conform(impl_1.schemaOf(c), obj);
    if (result instanceof impl_1.Problems)
        return result;
    return makeInstance(c, result);
}
exports.conformAs = conformAs;
function build(c, values, opts = {}) {
    const conformed = impl_1.usingBehaviour(opts, () => conformAs(c, values));
    if (conformed instanceof impl_1.Problems) {
        throw new impl_1.ValidationError(values, conformed, opts);
    }
    return conformed;
}
exports.build = build;
/**
 * Call this instead of build() when constructing data instances
 * by specifying fields in code. The compiler will complain if
 * fields are missing.
 *
 * `build(A, {})` will NOT cause the compiler to complain,
 * even if `{}` is missing fields `A` requires.
 *
 * `construct(A, {})` WILL cause the compiler to complain if
 * `{}` is missing fields `A` requires.
 */
function construct(c, value, opts = {}) {
    return build(c, value, opts);
}
exports.construct = construct;
class DataSchema extends core_1.BaseSchema {
    constructor(c) {
        super();
        this.c = c;
        this.subSchema = impl_1.schemaOf(c);
    }
    conform(value) {
        if (value instanceof this.c)
            return value;
        if (typeof value !== 'object')
            return impl_1.failure(`Expected an object but got a ${typeof value}`);
        try {
            return build(this.c, value);
        }
        catch (e) {
            if (e instanceof impl_1.ValidationError) {
                return e.problems;
            }
            throw e;
        }
    }
    toJSON(toJson) {
        return this.subSchema.toJSON(toJson);
    }
}
exports.DataSchema = DataSchema;
//# sourceMappingURL=data.js.map