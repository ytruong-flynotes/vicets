"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
function conformInPlace(thing, itemSchemas) {
    let problems = new __1.Problems([]);
    const unmatchedThingKeys = new Set(thing.keys());
    const { unexpected, missing } = __1.behaviour();
    for (const [k, s] of itemSchemas) {
        const v = s.conform(thing.get(k));
        if (__1.isError(v) && !thing.has(k)) {
            if (s[exports.optional] !== true && missing !== __1.MissingItemBehaviour.IGNORE) {
                problems = problems.merge(__1.failure("No value", [k]));
            }
            continue;
        }
        unmatchedThingKeys.delete(k);
        if (__1.isError(v)) {
            problems = problems.merge(v.prefixPath([k]));
        }
        else if (v !== undefined) {
            thing.set(k, v);
        }
    }
    for (const k of unmatchedThingKeys) {
        switch (unexpected) {
            case __1.UnexpectedItemBehaviour.IGNORE:
                break;
            case __1.UnexpectedItemBehaviour.DELETE:
                thing.delete(k);
                break;
            case __1.UnexpectedItemBehaviour.PROBLEM:
                problems = problems.merge(__1.failure("Unexpected item", [k]));
                break;
            default:
                throw new Error(`Not implemented- ${unexpected}`);
        }
    }
    return problems.length > 0 ? problems : undefined;
}
exports.conformInPlace = conformInPlace;
exports.optional = Symbol("optional");
class TagSchemaAsOptional extends __1.BaseSchema {
    constructor(subschema) {
        super();
        this.subschema = subschema;
        this[_a] = true;
    }
    conform(value) {
        return value === undefined ? undefined : this.subschema.conform(value);
    }
    toJSON(toJson) {
        return __1.subSchemaJson(this.subschema, toJson);
    }
}
_a = exports.optional;
exports.TagSchemaAsOptional = TagSchemaAsOptional;
function isOptional(schema) {
    return schema[exports.optional];
}
exports.isOptional = isOptional;
//# sourceMappingURL=associative.js.map