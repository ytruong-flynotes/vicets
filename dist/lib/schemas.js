"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
const impl_1 = require("./impl");
const functions_1 = require("./impl/util/functions");
function __(s) {
    return s.__();
}
exports.__ = __;
/**
 * Marks a field as optional. MUST be used as the outer schema:
 *
 * Ok:
 *
 * @data
 * class Cat {
 *   name?:string =__(opt(isstring().or(isnumber())))
 * }
 *
 * Not ok:
 *
 * @data
 * class Cat {
 *   name?:string =__(opt(isstring()).or(isnumber())
 * }
 */
function opt(s) {
    return new impl_1.TagSchemaAsOptional(s);
}
exports.opt = opt;
function isdata(constructor) {
    return new data_1.DataSchema(constructor);
}
exports.isdata = isdata;
function partial(type) {
    return onMissing(impl_1.schemaOf(type), impl_1.MissingItemBehaviour.IGNORE);
}
exports.partial = partial;
function onMissing(schema, behaviour) {
    return withBehaviour(schema, { missing: behaviour });
}
exports.onMissing = onMissing;
function onUnexpected(schema, behaviour) {
    return withBehaviour(schema, { unexpected: behaviour });
}
exports.onUnexpected = onUnexpected;
function withBehaviour(schema, behaviour) {
    return new impl_1.BehaviourSchema(behaviour, schema);
}
exports.withBehaviour = withBehaviour;
function deepNullablePattern(fieldSchemaArray) {
    const nullableFieldsObjectPattern = {};
    for (const [k, s] of fieldSchemaArray) {
        if ("fieldSchemaArray" in s) { // TODO testing if schema represents an object should be different
            const nullableFieldsObjectSchema = new impl_1.ObjectSchema(deepNullablePattern(s.fieldSchemaArray));
            nullableFieldsObjectPattern[k] = new impl_1.OrSchema([nullableFieldsObjectSchema, isnull()]);
        }
        else {
            nullableFieldsObjectPattern[k] = new impl_1.OrSchema([s, isnull()]);
        }
    }
    return nullableFieldsObjectPattern;
}
function deepNullable(type) {
    const objectSchema = impl_1.schemaOf(type);
    return new impl_1.ObjectSchema(deepNullablePattern(objectSchema.fieldSchemaArray));
}
exports.deepNullable = deepNullable;
function eq(value) {
    return new impl_1.EqualsSchema(value);
}
exports.eq = eq;
function gt(value) {
    return new impl_1.NumberSchema({ exclusiveMinimum: value });
}
exports.gt = gt;
function lt(value) {
    return new impl_1.NumberSchema({ exclusiveMaximum: value });
}
exports.lt = lt;
function gte(value) {
    return new impl_1.NumberSchema({ minimum: value });
}
exports.gte = gte;
function lte(value) {
    return new impl_1.NumberSchema({ maximum: value });
}
exports.lte = lte;
function range(from, to, { lowerInclusive = true, upperInclusive = false } = {}) {
    const min = lowerInclusive
        ? { minimum: from }
        : { exclusiveMinimum: from };
    const max = upperInclusive
        ? { maximum: to }
        : { exclusiveMaximum: to };
    return isnumber(Object.assign({}, min, max));
}
exports.range = range;
function isnull() {
    return eq(null);
}
exports.isnull = isnull;
function isobject() {
    return withBehaviour(new impl_1.ObjectSchema({}), { unexpected: impl_1.UnexpectedItemBehaviour.IGNORE });
}
exports.isobject = isobject;
function isundefined() {
    return eq(undefined);
}
exports.isundefined = isundefined;
function isany() {
    return schema((x) => x, () => true);
}
exports.isany = isany;
function fail(problems = impl_1.failure('always fails')) {
    return schema(() => problems, () => false);
}
exports.fail = fail;
function arrayof(schema) {
    return new impl_1.ArrayOfSchema(schema);
}
exports.arrayof = arrayof;
function setof(schema) {
    return new impl_1.SetOfSchema(schema);
}
exports.setof = setof;
function enumvalue(e) {
    return new impl_1.EnumValueSchema(e);
}
exports.enumvalue = enumvalue;
function enumkey(e) {
    const stringKeysOnly = {};
    for (let [k, v] of Object.entries(e)) {
        if (isNaN(Number(k)))
            stringKeysOnly[k] = v;
    }
    return lookup(stringKeysOnly);
}
exports.enumkey = enumkey;
function lookup(e) {
    return new impl_1.LookupSchema(e);
}
exports.lookup = lookup;
function discriminated(...ctors) {
    return discriminatedBy(impl_1.detectDiscriminator(ctors), ...ctors);
}
exports.discriminated = discriminated;
function discriminatedBy(discriminator, ...ctors) {
    return new impl_1.DiscriminatedUnionSchema(ctors, discriminator);
}
exports.discriminatedBy = discriminatedBy;
function isstring() {
    return new impl_1.StringSchema();
}
exports.isstring = isstring;
function isinstance(c) {
    return new impl_1.IsInstanceSchema(c);
}
exports.isinstance = isinstance;
function matches(r) {
    return new impl_1.RegExpSchema(r);
}
exports.matches = matches;
function conditional() {
    return new impl_1.ConditionalSchema([]);
}
exports.conditional = conditional;
function isboolean() {
    return new impl_1.BooleanSchema();
}
exports.isboolean = isboolean;
function isIn(...values) {
    return new impl_1.InSchema(values);
}
exports.isIn = isIn;
function isurl(opts) {
    return new impl_1.UrlSchema(opts || {});
}
exports.isurl = isurl;
function isuuid() {
    return new impl_1.UuidSchema();
}
exports.isuuid = isuuid;
function isnumber(opts = {}) {
    return new impl_1.NumberSchema(opts);
}
exports.isnumber = isnumber;
const DATE_TIME = new impl_1.IsoUtcDateSchema(impl_1.TimeExpectation.ALWAYS);
function isoUtcDateTime() {
    return DATE_TIME;
}
exports.isoUtcDateTime = isoUtcDateTime;
const DATE = new impl_1.IsoUtcDateSchema(impl_1.TimeExpectation.NEVER);
function isoDateOnly() {
    return DATE;
}
exports.isoDateOnly = isoDateOnly;
/**
 * E.164 phone number normaliser
 * if no default country is passed, it validates number depending on coutry calling code (has to begin with '+')
 */
function e164PhoneNumber(defaultCountryIso3166) {
    return new impl_1.E164PhoneNumberSchema(defaultCountryIso3166);
}
exports.e164PhoneNumber = e164PhoneNumber;
function object(pattern) {
    return new impl_1.ObjectSchema(pattern);
}
exports.object = object;
function deepPartial(pattern) {
    return onUnexpected(new impl_1.ObjectSchema(pattern), impl_1.UnexpectedItemBehaviour.IGNORE);
}
exports.deepPartial = deepPartial;
/**
 * An object where all values conform to schema
 */
function objof(schema) {
    return new impl_1.ObjOfSchema(schema);
}
exports.objof = objof;
function map(entryPattern) {
    const subSchema = new impl_1.ObjectSchema(entryPattern instanceof Map
        ? impl_1.schematizeEntries(entryPattern)
        : entryPattern);
    return new impl_1.MapSchema(subSchema);
}
exports.map = map;
function tuple(...s) {
    return new impl_1.TupleSchema(s);
}
exports.tuple = tuple;
function schema(conform, toJSON) {
    return new impl_1.DelegatingSchema(conform, toJSON);
}
exports.schema = schema;
function predicate(predicate, failureMessage) {
    function buildPredicateMessageFunction(message, predicate) {
        switch (typeof message) {
            case 'string':
                return () => message;
            case 'function':
                return message;
            case 'undefined':
                return () => predicate.toString();
            default:
                throw new Error(`Not a valid message ${message}`);
        }
    }
    const messageFn = buildPredicateMessageFunction(failureMessage, predicate);
    return schema((x) => predicate(x) === true ? x : impl_1.failure(messageFn(x)));
}
exports.predicate = predicate;
/**
 * Note that when using `defer()` to recursively nest schemas, by default `toJSON()` will
 * stack overflow.
 *
 * You need to make sure that all schemas used in recursion are in the definitions
 * when calling jsonSchema(), so that they get replaced by $refs.
 *
 * ```
 * const node = object({children: arrayof(defer(() =>node))});
 *
 * // this will overflow:
 * node.toJSON();
 *
 * // this will not:
 * jsonSchema({definitions:{node: node}};
 * ```
 */
function defer(factory) {
    return new impl_1.DeferredSchema(factory);
}
exports.defer = defer;
function override(s, o) {
    return new impl_1.OverrideSchema(s, o);
}
exports.override = override;
function unique() {
    return uniqueBy(functions_1.identity);
}
exports.unique = unique;
function uniqueBy(fn) {
    return new impl_1.UniqueSchema(fn);
}
exports.uniqueBy = uniqueBy;
function select(path, s) {
    return new impl_1.SelectSchema(path, s);
}
exports.select = select;
function anyOf(...items) {
    const result = items.reduce((result, item) => {
        const schema = impl_1.isSchema(item) ? item : eq(item);
        return result ? result.or(schema) : schema;
    }, undefined);
    return result || fail(impl_1.failure('oneOf() with no values provided'));
}
exports.anyOf = anyOf;
var lens_1 = require("./impl/lens");
exports.LensBehaviour = lens_1.LensBehaviour;
/**
 * Expects an object. Conforms value at path using schema, and returns the outer object.
 *
 * lens(["a", "b"], eq("valid")).conform({a:{b:"valid"}}) returns {a:{b:"valid"}}
 */
function lens(path, s) {
    return new impl_1.LensSchema(path, s);
}
exports.lens = lens;
function defaultValue(value, schema) {
    return new impl_1.DefaultValueSchema(value, schema);
}
exports.defaultValue = defaultValue;
//# sourceMappingURL=schemas.js.map