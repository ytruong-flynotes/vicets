import { __decorate } from 'tslib';
import phone from 'phone';
import validator from 'validator';

class Problem {
    constructor(path, message) {
        this.path = path;
        this.message = message;
    }
    prefixPath(p) {
        return new Problem([...p, ...this.path], this.message);
    }
    toString() {
        return `[${this.path.join(' -> ').trimRight()}] : ${this.message}`;
    }
}
class Problems {
    constructor(problems) {
        this.problems = problems;
    }
    get length() {
        return this.problems.length;
    }
    prefixPath(p) {
        return new Problems(this.problems.map(e => e.prefixPath(p)));
    }
    merge(...ps) {
        return ps.reduce((acc, next) => acc.append(...next.problems), this);
    }
    append(...ps) {
        return new Problems([...this.problems, ...ps]);
    }
    toString() {
        return this.problems.map(e => e.toString()).join('\r\n');
    }
}
function isError(x) {
    return x != null && x instanceof Problems;
}
function isSuccess(x) {
    return !isError(x);
}
function problem(message, path = []) {
    return new Problem(path, message);
}
function problems(...ps) {
    return new Problems(ps);
}
function failure(message, path = []) {
    return problems(problem(message, path));
}

function validate(schema, value, opts = {}) {
    const conformed = conform(schema, value, opts);
    if (conformed instanceof Problems) {
        throw new ValidationError(value, conformed, opts);
    }
    return conformed;
}
function conform(schema, value, opts = {}) {
    if (!schema)
        throw new Error("No schema provided");
    return usingBehaviour(opts, () => schema.conform(value));
}

function isPrimitive(value) {
    return (typeof value !== 'object' && typeof value !== 'function') || value === null;
}
function unsafeCast(x) {
    return x;
}
function typeDescription(x) {
    if (x === null)
        return 'null';
    let t = typeof x;
    if (t !== 'object')
        return t;
    const p = Object.getPrototypeOf(x);
    if (p !== Object.prototype)
        return p.constructor.name;
    return t;
}

class BaseSchema {
    or(s) {
        return new OrSchema([this, s]);
    }
    and(s) {
        return new AndSchema([this, s]);
    }
    __() {
        return this;
    }
}
class AndSchema extends BaseSchema {
    constructor(subSchemas) {
        super();
        this.subSchemas = subSchemas;
    }
    conform(value) {
        return this.subSchemas.reduce((result, schema) => {
            if (isError(result))
                return result;
            return conform(schema, result);
        }, value);
    }
    and(s) {
        return s instanceof AndSchema
            ? new AndSchema([...this.subSchemas, ...s.subSchemas])
            : new AndSchema([...this.subSchemas, s]);
    }
    toJSON(toJson) {
        return {
            allOf: subSchemaJson(this.subSchemas, toJson)
        };
    }
}
class OrSchema extends BaseSchema {
    constructor(subSchemas) {
        super();
        this.subSchemas = subSchemas;
    }
    conform(value) {
        const failures = [];
        for (const s of this.subSchemas) {
            const result = s.conform(value);
            if (isSuccess(result))
                return result;
            failures.push(result);
        }
        return failures.reduce((a, ps) => a ? a.merge(ps) : ps);
    }
    or(s) {
        return s instanceof OrSchema
            ? new OrSchema([...this.subSchemas, ...s.subSchemas])
            : new OrSchema([...this.subSchemas, s]);
    }
    toJSON(toJson) {
        return {
            anyOf: subSchemaJson(this.subSchemas, toJson)
        };
    }
}
class BaseStringSchema extends BaseSchema {
    conform(value) {
        if (typeof value === 'string' || value instanceof String)
            return this.conformString(value);
        return failure(`expected a string but got ${typeDescription(value)}`);
    }
    toJSON() {
        return { type: "string" };
    }
}
class StringSchema extends BaseStringSchema {
    conformString(value) {
        return value;
    }
}
class DelegatingSchema extends BaseSchema {
    constructor(delegatedConform, toJSON = () => {
        throw new Error('toJSON not implemented');
    }) {
        super();
        this.delegatedConform = delegatedConform;
        this.toJSON = toJSON;
    }
    conform(value) {
        return this.delegatedConform(value);
    }
}
function isSchema(value) {
    // TODO: probably wrong?
    return value instanceof BaseSchema;
}

function mapKeyValue(f, m) {
    const result = new Map();
    for (const [k, v] of m.entries()) {
        const [nk, nv] = f(k, v);
        result.set(nk, nv);
    }
    return result;
}
function mapValues(f, m) {
    return mapKeyValue((k, v) => [k, f(v)], m);
}
function merge(a, b, conflictFn) {
    const result = new Map();
    for (const [k, v] of a.entries()) {
        result.set(k, v);
    }
    for (const [k, v] of b.entries()) {
        if (result.has(k)) {
            result.set(k, conflictFn(a.get(k), v));
        }
        else {
            result.set(k, v);
        }
    }
    return result;
}

function subSchemaJson(schema, toJson) {
    toJson = toJson || ((s) => s.toJSON());
    return Array.isArray(schema)
        ? schema.map(toJson)
        : toJson(schema);
}
function refLookup(defs, path = "#/definitions") {
    return Object.entries(defs)
        .reduce((result, [k, schemaOrDefs]) => {
        const itemPath = `${path}/${k}`;
        if (isSchema(schemaOrDefs)) {
            if (schemaOrDefs instanceof DataSchema)
                schemaOrDefs = schemaOrDefs.subSchema;
            result.set(schemaOrDefs, { $ref: itemPath });
            return result;
        }
        else {
            const lookup = refLookup(schemaOrDefs, itemPath);
            return merge(result, lookup, () => {
                throw new Error('Should never happen');
            });
        }
    }, new Map());
}
function definitionsJson(defs, toJson) {
    return Object.entries(defs)
        .reduce((result, [k, schemaOrDefs]) => {
        if (isSchema(schemaOrDefs))
            result[k] = schemaOrDefs.toJSON(toJson);
        else
            result[k] = definitionsJson(schemaOrDefs, toJson);
        return result;
    }, {});
}
function jsonSchema(opts) {
    const lookup = refLookup(opts.definitions);
    function subschema(schema) {
        if (schema instanceof DataSchema)
            schema = schema.subSchema;
        const ref = lookup.get(schema);
        const result = ref || schema.toJSON(subschema);
        return result;
    }
    const definitions = definitionsJson(opts.definitions, subschema);
    return Object.assign({}, (opts.id && { id: opts.id }), { $schema: "http://json-schema.org/draft-07/schema#", definitions });
}

var UnexpectedItemBehaviour;
(function (UnexpectedItemBehaviour) {
    UnexpectedItemBehaviour["DELETE"] = "delete";
    UnexpectedItemBehaviour["IGNORE"] = "ignore";
    UnexpectedItemBehaviour["PROBLEM"] = "problem";
})(UnexpectedItemBehaviour || (UnexpectedItemBehaviour = {}));
var MissingItemBehaviour;
(function (MissingItemBehaviour) {
    MissingItemBehaviour["IGNORE"] = "ignore";
    MissingItemBehaviour["PROBLEM"] = "problem";
})(MissingItemBehaviour || (MissingItemBehaviour = {}));
let BEHAVIOUR = {
    unexpected: UnexpectedItemBehaviour.PROBLEM,
    missing: MissingItemBehaviour.PROBLEM,
    leakActualValuesInError: false,
};
function behaviour() {
    return BEHAVIOUR;
}
function usingBehaviour(behaviour, fn) {
    const old = BEHAVIOUR;
    BEHAVIOUR = Object.assign({}, old, behaviour);
    try {
        return fn();
    }
    finally {
        BEHAVIOUR = old;
    }
}
class BehaviourSchema extends BaseSchema {
    constructor(behaviour, subSchema) {
        super();
        this.behaviour = behaviour;
        this.subSchema = subSchema;
    }
    conform(value) {
        return usingBehaviour(this.behaviour, () => conform(this.subSchema, value));
    }
    toJSON(toJson) {
        return Object.assign({}, subSchemaJson(this.subSchema, toJson), { additionalProperties: this.behaviour.unexpected !== UnexpectedItemBehaviour.PROBLEM });
    }
}

var _a;
function conformInPlace(thing, itemSchemas) {
    let problems = new Problems([]);
    const unmatchedThingKeys = new Set(thing.keys());
    const { unexpected, missing } = behaviour();
    for (const [k, s] of itemSchemas) {
        const v = s.conform(thing.get(k));
        if (isError(v) && !thing.has(k)) {
            if (s[optional] !== true && missing !== MissingItemBehaviour.IGNORE) {
                problems = problems.merge(failure("No value", [k]));
            }
            continue;
        }
        unmatchedThingKeys.delete(k);
        if (isError(v)) {
            problems = problems.merge(v.prefixPath([k]));
        }
        else if (v !== undefined) {
            thing.set(k, v);
        }
    }
    for (const k of unmatchedThingKeys) {
        switch (unexpected) {
            case UnexpectedItemBehaviour.IGNORE:
                break;
            case UnexpectedItemBehaviour.DELETE:
                thing.delete(k);
                break;
            case UnexpectedItemBehaviour.PROBLEM:
                problems = problems.merge(failure("Unexpected item", [k]));
                break;
            default:
                throw new Error(`Not implemented- ${unexpected}`);
        }
    }
    return problems.length > 0 ? problems : undefined;
}
const optional = Symbol("optional");
class TagSchemaAsOptional extends BaseSchema {
    constructor(subschema) {
        super();
        this.subschema = subschema;
        this[_a] = true;
    }
    conform(value) {
        return value === undefined ? undefined : this.subschema.conform(value);
    }
    toJSON(toJson) {
        return subSchemaJson(this.subschema, toJson);
    }
}
_a = optional;
function isOptional(schema) {
    return schema[optional];
}

class MapSchema extends BaseSchema {
    constructor(subSchema) {
        super();
        this.subSchema = subSchema;
    }
    conform(value) {
        if (value === undefined || value === null)
            return failure('no value');
        if (!(value instanceof Map || typeof value === 'object'))
            return failure(`expected a Map or object but got ${typeDescription(value)}`);
        const instance = new Map();
        const kvs = value instanceof Map ? value.entries() : Object.entries(value);
        for (let [k, v] of kvs) {
            instance.set(k, v);
        }
        const problems = conformInPlace(instance, this.subSchema.fieldSchemaArray);
        return problems ? problems : instance;
    }
    toJSON(toJson) {
        return subSchemaJson(this.subSchema, toJson);
    }
}

function addGetter(obj, k, getter) {
    Object.defineProperty(obj, k, {
        enumerable: true,
        configurable: true,
        get: getter
    });
    return obj;
}
function copyGetters(original) {
    return Object
        .keys(original)
        .reduce((mapped, k) => addGetter(mapped, k, () => original[k]), {});
}
function merge$1(a, b, conflictFn) {
    const result = {};
    for (const k in a) {
        result[k.toString()] = a[k];
    }
    for (const k in b) {
        if (k in result) {
            const kk = k;
            result[k.toString()] = conflictFn(a[kk], b[kk]);
        }
        else {
            result[k.toString()] = b[k];
        }
    }
    return result;
}

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
function patternItemToSchema(item) {
    if (typeof item !== 'object')
        return new EqualsSchema(item);
    if (item instanceof Array)
        return new TupleSchema(item.map(v => patternItemToSchema(v)));
    if (typeof item === 'undefined')
        return new EqualsSchema(undefined);
    if (item === null)
        return new EqualsSchema(null);
    if (typeof item['conform'] === 'function')
        return item;
    return new ObjectSchema(item);
}
function patternToSchemas(pattern) {
    const result = {};
    for (const k of Object.keys(pattern)) {
        const s = pattern[k];
        result[k] = patternItemToSchema(s);
    }
    return result;
}
class ObjectStrategies {
    constructor(result) {
        this.result = result;
    }
    set(k, v) {
        addGetter(this.result, k, () => v);
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
class ObjectSchema extends BaseSchema {
    constructor(pattern) {
        super();
        this.pattern = pattern;
        this.fieldSchemaArray = objectEntries(patternToSchemas(pattern));
    }
    conform(value) {
        if (value === undefined || value === null)
            return failure('no value');
        if (typeof value !== 'object')
            return failure(`expected an object but got ${typeof value}`);
        const instance = copyGetters(value);
        return this.conformInPlace(instance);
    }
    /**
     * Required to allow @hasSchema to conform 'this'
     */
    conformInPlace(instance) {
        const problems = conformInPlace(new ObjectStrategies(instance), this.fieldSchemaArray);
        return problems ? problems : instance;
    }
    intersect(other) {
        const mergedSchemas = merge$1(this.pattern, other.pattern, (a, b) => a.and(b));
        return new ObjectSchema(mergedSchemas);
    }
    toJSON(toJson) {
        const properties = this.fieldSchemaArray.reduce((result, [k, subSchema]) => {
            result[k] = subSchemaJson(subSchema, toJson);
            return result;
        }, {});
        const required = this.fieldSchemaArray
            .filter(([k, schema]) => !isOptional(schema))
            .map(([k]) => k);
        return {
            type: "object",
            properties: properties,
            required: required,
        };
    }
}

class ObjOfSchema extends BaseSchema {
    constructor(valueSchema) {
        super();
        this.valueSchema = valueSchema;
    }
    conform(value) {
        if (value === undefined || value === null)
            return failure('no value');
        if (typeof value !== 'object')
            return failure(`expected an object but got ${typeof value}`);
        const itemSchemas = Object.keys(value).map(k => [k, this.valueSchema]);
        const instance = {};
        Object.assign(instance, value);
        const problems = conformInPlace(new ObjectStrategies(instance), itemSchemas);
        return problems ? problems : instance;
    }
    toJSON(toJson) {
        return {
            type: "object",
            patternProperties: {
                ".*": subSchemaJson(this.valueSchema, toJson)
            }
        };
    }
}

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
class TupleSchema extends BaseSchema {
    constructor(schemas) {
        super();
        this.itemSchemas = schemas.map((v, i) => [i, v]);
    }
    conform(value) {
        if (value === undefined || value === null)
            return failure('no value');
        if (!(value instanceof Array))
            return failure(`expected an array but got ${typeDescription(value)}`);
        const instance = [];
        for (let i = 0; i < value.length; i++) {
            instance[i] = value[i];
        }
        const result = new TupleStrategies(instance);
        const problems = conformInPlace(result, this.itemSchemas);
        return problems ? problems : result.result;
    }
    toJSON(toJson) {
        return {
            type: "array",
            items: subSchemaJson(this.itemSchemas.map(([k, v]) => v), toJson)
        };
    }
}

function wrapAssociative(actual) {
    if (actual instanceof Array)
        return new TupleStrategies(actual);
    if (typeof actual === 'object')
        return new ObjectStrategies(actual);
    throw new Error(`Not supported: ${typeof actual}`);
}
function empty(actual) {
    if (actual instanceof Array)
        return [];
    if (typeof actual === 'object')
        return {};
    throw new Error(`Not supported: ${typeof actual}`);
}

function first(coll) {
    // noinspection LoopStatementThatDoesntLoopJS
    for (const v of coll) {
        return v;
    }
}

class CandidateDiscriminators {
    constructor(ctors) {
        this.constructors = [];
        this.fields = new Map();
        this.constructors = [...ctors];
        for (const ctor of this.constructors) {
            for (const [fieldName, value] of CandidateDiscriminators.fieldsWithPrimitiveEquals(ctor)) {
                const result = this.fields.get(fieldName) || new Map();
                result.set(value, (result.get(value) || []).concat([ctor]));
                this.fields.set(fieldName, result);
            }
        }
    }
    static fieldsWithPrimitiveEquals(ctor) {
        return CandidateDiscriminators.fieldSchemas(ctor)
            .map(([field, schema]) => schema instanceof EqualsSchema && isPrimitive(schema.expected) ? [field, schema.expected] : undefined)
            .filter((x) => x)
            .map((x) => unsafeCast(x));
    }
    static fieldSchemas(ctor) {
        return schemaOf(ctor).fieldSchemaArray;
    }
    keys() {
        return this.fields.keys();
    }
    get(field) {
        return this.fields.get(field);
    }
    problemWithDiscriminator(field) {
        const values = this.fields.get(field);
        for (const [value, ctors] of values) {
            if (ctors.length > 1)
                return `value '${value}' is repeated in: ${ctors.map((c) => c.name).join(", ")}`;
        }
        if (values.size !== this.constructors.length)
            return 'field is not present in all classes';
    }
}
class DiscriminatorReport {
    constructor() {
        this.problems = new Map();
        this.validFields = new Map();
    }
    reject(k, problem) {
        this.problems.set(k, problem);
        return this;
    }
    accept(k, mappings) {
        this.validFields.set(k, mappings);
        return this;
    }
}
function detectDiscriminator(ctors) {
    const report = discriminatorReports(ctors);
    if (report.validFields.size > 1)
        throw new Error(`Multiple possible discriminator fields: [${Array.from(report.validFields.keys()).join(', ')}]`);
    if (report.validFields.size === 0 && report.problems.size === 0)
        throw new Error(`No discriminator fields found in: [${ctors.map((c) => c.name).join(', ')}]`);
    const k = first(report.validFields.keys());
    if (k !== undefined) {
        return k;
    }
    const listOfFieldProblems = Array.from(report.problems.entries()).map(([k, problem]) => `${k}: ${problem}`);
    throw new Error(`No discriminator field found. Considered:\r\n${listOfFieldProblems.join('\r\n')}`);
}
function discriminatorReports(ctors) {
    const candidates = new CandidateDiscriminators(ctors);
    const report = new DiscriminatorReport();
    for (const k of candidates.keys()) {
        const problem = candidates.problemWithDiscriminator(k);
        if (problem !== undefined)
            report.reject(k, problem);
        else
            report.accept(k, mapKeyValue((k, v) => [k, v[0]], candidates.get(k)));
    }
    return report;
}

class DiscriminatedUnionSchema extends BaseSchema {
    constructor(ctors, discriminator) {
        super();
        this.ctors = ctors;
        this.discriminator = discriminator;
        const report = discriminatorReports(ctors);
        const schemasByValue = report.validFields.get(this.discriminator);
        if (schemasByValue === undefined)
            throw new Error(`Discriminator '${discriminator}' is not valid: ${report.problems.get(discriminator) || 'not found in classes'}.`);
        this.schemasByDiscriminatorValue = mapValues((v) => new DataSchema(v), schemasByValue);
    }
    conform(value) {
        if (typeof value !== 'object')
            return failure(`expected an object but got ${typeof value}`);
        if (!(this.discriminator in value))
            return failure("no value", [this.discriminator]);
        const schema = this.schemaFor(value);
        if (schema === undefined)
            return failure(`expected one of [${Array.from(this.schemasByDiscriminatorValue.keys()).join(", ")}]`, [this.discriminator]);
        return schema.conform(value);
    }
    or(that) {
        if (that instanceof DiscriminatedUnionSchema
            && this.discriminator === that.discriminator) {
            try {
                // This will give much better error messages, if it's possible
                // to combine the schemas.
                return new DiscriminatedUnionSchema([...this.ctors, ...that.ctors], this.discriminator);
            }
            catch (e) {
                //lean on constructor validation logic
            }
        }
        return super.or(that);
    }
    schemaFor(value) {
        const discriminatorValue = value[this.discriminator];
        return this.schemasByDiscriminatorValue.get(discriminatorValue);
    }
    toJSON(toJson) {
        const allOf = [];
        for (const [v, schema] of this.schemasByDiscriminatorValue.entries()) {
            allOf.push({
                if: { properties: { [this.discriminator]: { const: v } } },
                then: subSchemaJson(schema, toJson),
            });
        }
        return {
            type: "object",
            properties: {
                [this.discriminator]: true
            },
            allOf
        };
    }
}

class ArrayOfSchema extends BaseSchema {
    constructor(itemSchema) {
        super();
        this.itemSchema = itemSchema;
    }
    conform(value) {
        if (!(value instanceof Array))
            return failure(`${typeDescription(value)} was not an Array`);
        const conformed = new Array(value.length);
        let problems = new Problems([]);
        for (let i = 0; i < value.length; i++) {
            const conformedItem = this.itemSchema.conform(value[i]);
            if (conformedItem instanceof Problems)
                problems = problems.merge(conformedItem.prefixPath([i]));
            else
                conformed[i] = conformedItem;
        }
        if (problems.length > 0)
            return problems;
        return conformed;
    }
    toJSON(toJson) {
        return {
            type: "array",
            contains: subSchemaJson(this.itemSchema, toJson),
        };
    }
}

class BooleanSchema extends BaseSchema {
    conform(value) {
        const t = typeof value;
        if (value instanceof Boolean || t === "boolean")
            return value;
        if (value instanceof String || t === "string") {
            const s = value.toLowerCase();
            if (["true", "false"].indexOf(s) < 0)
                return failure(`expected a boolean`);
            return s === 'true';
        }
        return failure(`expected a boolean`);
    }
    toJSON() {
        return { type: "boolean" };
    }
}

function toJSON(value) {
    if (Array.isArray(value))
        return value.map(v => toJSON(v));
    if (typeof value === "object")
        return typeof value['toJSON'] === 'function' ? value.toJSON() : value;
    return value;
}

class DefaultValueSchema extends BaseSchema {
    constructor(value, subschema) {
        super();
        this.value = value;
        this.subschema = subschema;
    }
    conform(value) {
        if (value === undefined)
            value = this.value();
        return this.subschema.conform(value);
    }
    toJSON(toJson) {
        return Object.assign({}, subSchemaJson(this.subschema, toJson), { default: toJSON(this.value()) });
    }
}

class DeferredSchema extends BaseSchema {
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
        return subSchemaJson(this.subschema, toJson);
    }
}

class E164PhoneNumberSchema extends BaseSchema {
    constructor(defaultCountryIso3166) {
        super();
        this.defaultCountryIso3166 = defaultCountryIso3166;
    }
    conform(value) {
        if (typeof value !== 'string')
            return failure(`expected a string but got ${typeDescription(value)}`);
        const result = this.defaultCountryIso3166 ? phone(value, this.defaultCountryIso3166) : phone(value);
        if (result.length === 0) {
            return failure(`expected a valid E.164 phone number`);
        }
        else {
            return result[0];
        }
    }
    toJSON() {
        return {
            type: "string",
            description: "Phone number",
        };
    }
}

var EntryType;
(function (EntryType) {
    EntryType[EntryType["StringMember"] = 0] = "StringMember";
    EntryType[EntryType["ReverseMapping"] = 1] = "ReverseMapping";
    EntryType[EntryType["NumericMember"] = 2] = "NumericMember";
    EntryType[EntryType["Invalid"] = 3] = "Invalid";
})(EntryType || (EntryType = {}));
var EnumType;
(function (EnumType) {
    EnumType[EnumType["InitializedStrings"] = 0] = "InitializedStrings";
    EnumType[EnumType["InitializedIntegers"] = 1] = "InitializedIntegers";
    EnumType[EnumType["Mixed"] = 2] = "Mixed";
})(EnumType || (EnumType = {}));
function analyseEnum(e) {
    let allStringMembers = true;
    let someStringMembers = false;
    const values = new Set();
    for (let [k, v] of Object.entries(e)) {
        if (!isNaN(Number(k)))
            k = Number(k);
        const valueType = typeof v;
        const keyType = typeof k;
        const entryType = (keyType === 'string' && valueType === 'string') ? EntryType.StringMember :
            (keyType === 'string' && valueType === 'number') ? EntryType.NumericMember :
                (keyType === 'number' && valueType === 'string') ? EntryType.ReverseMapping :
                    EntryType.Invalid;
        if (entryType === EntryType.Invalid)
            throw new Error(`Entries must be string:number, number:string or string:string. Field '${k}' was ${typeDescription(k)}:${typeDescription(v)}.`);
        if (entryType !== EntryType.StringMember)
            allStringMembers = false;
        if (entryType !== EntryType.ReverseMapping)
            values.add(v);
        if (entryType === EntryType.StringMember)
            someStringMembers = true;
        else if (e[v.toString()] != k)
            throw new Error(`Not a proper enum. e["${k}"] = ${JSON.stringify(v)} but e["${v}"] = ${JSON.stringify(e[v])}`);
    }
    const type = allStringMembers ? EnumType.InitializedStrings :
        someStringMembers ? EnumType.Mixed :
            EnumType.InitializedIntegers;
    return { values, type };
}

class EnumValueSchema extends BaseSchema {
    constructor(e) {
        super();
        this.e = e;
        const { values, type } = analyseEnum(this.e);
        this.enumValues = values;
        this.enumType = type;
        this.failureMessage = `expected one of [${Array.from(this.enumValues).map((v) => JSON.stringify(v)).join(', ')}]`;
    }
    conform(value) {
        if (this.enumValues.has(value))
            return value;
        return failure(this.failureMessage);
    }
    toJSON() {
        switch (this.enumType) {
            case EnumType.InitializedIntegers:
                return {
                    type: "number",
                    enum: [...this.enumValues]
                };
            case EnumType.InitializedStrings:
                return {
                    type: "string",
                    enum: [...this.enumValues]
                };
            case EnumType.Mixed:
                return {
                    type: ["string", "number"],
                    enum: [...this.enumValues]
                };
            default:
                throw new Error(`Enum type ${JSON.stringify(this.enumType)} not supported`);
        }
    }
}

class EqualsSchema extends BaseSchema {
    constructor(expected) {
        super();
        this.expected = expected;
    }
    conform(value) {
        if (value !== this.expected)
            return failure(`expected "${this.expected}" but got ${typeDescription(value)}: ${JSON.stringify(value)}`);
        return value;
    }
    toJSON() {
        return { const: this.expected };
    }
}

class InSchema extends BaseSchema {
    constructor(values) {
        super();
        if (values.length === 0)
            throw new Error('At least one value is required');
        this.values = new Set(values);
    }
    conform(value) {
        if (!this.values.has(value))
            return failure(`expected one of [${Array.from(this.values).join(', ')}]`);
        return value;
    }
    toJSON() {
        const values = [...this.values].map(v => toJSON(v));
        const types = new Set(values.map(v => typeof v));
        return {
            type: types.size === 1 ? types.values().next().value : [...types],
            enum: values
        };
    }
}

class IsInstanceSchema extends BaseSchema {
    constructor(c) {
        super();
        this.c = c;
    }
    conform(value) {
        return value instanceof this.c ? value : failure(`expected ${this.c.name} but got ${typeDescription(value)}`);
    }
    /**
     * This isn't really suitable for json schema,
     * which doesn't have the concept of a type
     */
    toJSON() {
        return {
            type: "object",
            description: `Instance of ${this.c.name}`,
            additionalProperties: true,
        };
    }
}

function utcDate(year, month, date, hours, minutes, seconds, ms) {
    const ts = ms ? Date.UTC(year, month, date, hours, minutes, seconds, ms)
        : seconds ? Date.UTC(year, month, date, hours, minutes, seconds)
            : minutes ? Date.UTC(year, month, date, hours, minutes)
                : hours ? Date.UTC(year, month, date, hours)
                    : Date.UTC(year, month, date);
    return new Date(ts);
}

const regex = /^([1-9][0-9]{3})-([0-1][0-9])-([0-3][0-9])(T([0-2][0-9]):([0-6][0-9])(:([0-6][0-9])(\.([0-9]{3}))?)?((Z)|(\+([0-2][0-9]):([0-6][0-9]))))?$/;
var TimeExpectation;
(function (TimeExpectation) {
    TimeExpectation["NEVER"] = "never";
    TimeExpectation["ALWAYS"] = "always";
    TimeExpectation["MAYBE"] = "maybe";
})(TimeExpectation || (TimeExpectation = {}));
class IsoUtcDateSchema extends BaseSchema {
    constructor(time) {
        super();
        this.time = time;
    }
    conform(value) {
        if (typeof value === 'string') {
            const match = regex.exec(value);
            if (!match)
                return failure("expected a valid ISO8601 string");
            try {
                const year = Number.parseInt(match[1]);
                const month = Number.parseInt(match[2]) - 1;
                const date = Number.parseInt(match[3]);
                if (value.length === 10 && this.time === TimeExpectation.ALWAYS)
                    return failure("date should have a time of day component");
                const hours = match[5] ? Number.parseInt(match[5]) : 0;
                const minutes = match[6] ? Number.parseInt(match[6]) : 0;
                const seconds = match[8] ? Number.parseInt(match[8]) : 0;
                const millis = match[10] ? Number.parseInt(match[10]) : 0;
                const offsetHours = match[14] ? Number.parseInt(match[14]) : 0;
                const offsetMinutes = match[15] ? Number.parseInt(match[15]) : 0;
                if (offsetHours !== 0 || offsetMinutes !== 0)
                    return failure("expected a UTC date, with timezone specified as Z or 00:00");
                value = utcDate(year, month, date, hours, minutes, seconds, millis);
                if (value.getUTCFullYear() !== year ||
                    value.getUTCMonth() !== month ||
                    value.getUTCDate() !== date ||
                    value.getUTCHours() !== hours ||
                    value.getUTCMinutes() !== minutes ||
                    value.getUTCMilliseconds() !== millis)
                    return failure("expected a valid date");
            }
            catch (_a) {
                return failure("expected a valid date");
            }
        }
        if (!(value instanceof Date))
            return failure("expected a date or string");
        if (this.time === TimeExpectation.NEVER && utcDate(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()).getTime() !== value.getTime())
            return failure("date should not have a time of day component");
        return value;
    }
    toJSON() {
        return {
            type: "string", format: this.time === TimeExpectation.ALWAYS
                ? 'date-time'
                : this.time === TimeExpectation.NEVER
                    ? 'date'
                    : 'date-time'
        };
    }
}

function setAtPath(obj, path, value) {
    if (path.length === 1) {
        obj[path[0]] = value;
        return obj;
    }
    const key = path[0];
    setAtPath(obj[key], path.slice(1), value);
    return obj;
}
class LensSchema extends BaseSchema {
    constructor(path, subschema) {
        super();
        this.path = path;
        this.subschema = new SelectSchema(path, subschema);
    }
    conform(value) {
        if (typeof value !== 'object')
            return failure("expected an object");
        const conformed = this.subschema.conform(value);
        if (conformed instanceof Problems)
            return conformed;
        return setAtPath(value, this.path, conformed);
    }
    toJSON() {
        throw new Error("Not implemented");
    }
}
var LensBehaviour;
(function (LensBehaviour) {
    LensBehaviour["MODIFY_IN_PLACE"] = "modify-in-place";
    // Deep clone is not implemented.
    // Just a marker enum to flag the behaviour
})(LensBehaviour || (LensBehaviour = {}));

class LookupSchema extends BaseSchema {
    constructor(lookup) {
        super();
        this.lookup = lookup;
    }
    conform(value) {
        if (typeof value !== 'string')
            return failure(`expected a string but got ${typeDescription(value)}`);
        if (value in this.lookup)
            return this.lookup[value];
        return failure(`expected one of [${Object.keys(this.lookup).map((k) => JSON.stringify(k)).join(', ')}]`);
    }
    toJSON() {
        return {
            type: "string",
            enum: Object.keys(this.lookup)
        };
    }
}

class NumberSchema extends BaseSchema {
    constructor(opts) {
        super();
        this.opts = opts;
    }
    conform(value) {
        if (typeof value !== 'number')
            return failure('expected a number');
        const { minimum, exclusiveMinimum, maximum, exclusiveMaximum, multipleOf } = this.opts;
        const p = [];
        if (minimum && !(value >= minimum))
            p.push(problem(`must be greater than or equal to ${minimum}`));
        if (exclusiveMinimum && !(value > exclusiveMinimum))
            p.push(problem(`must be greater than ${exclusiveMinimum}`));
        if (maximum && !(value <= maximum))
            p.push(problem(`must be less than or equal to ${maximum}`));
        if (exclusiveMaximum && !(value < exclusiveMaximum))
            p.push(problem(`must be less than ${exclusiveMaximum}`));
        if (multipleOf && value % multipleOf !== 0)
            p.push(problem(`must be multiple of ${multipleOf}`));
        return (p.length > 0)
            ? problems(...p)
            : value;
    }
    toJSON() {
        const { minimum, exclusiveMinimum, maximum, exclusiveMaximum, multipleOf } = this.opts;
        return Object.assign({ type: "number" }, (minimum && { minimum }), (exclusiveMinimum && { exclusiveMinimum }), (maximum && { maximum }), (exclusiveMaximum && { exclusiveMaximum }), (multipleOf && { multiple: multipleOf }));
    }
}

class OverrideSchema extends BaseSchema {
    constructor(subschema, overrides) {
        super();
        this.subschema = subschema;
        this.overrides = overrides;
    }
    conform(value) {
        const result = this.subschema.conform(value);
        return result instanceof Problems
            ? this.failure(value, result)
            : result;
    }
    failure(value, original) {
        const f = this.overrides.failure;
        if (!f) {
            return original;
        }
        else if (typeof f === 'string') {
            return failure(f);
        }
        else if (f instanceof Function) {
            return f(value);
        }
        else {
            throw new Error(`Not implemented for ${typeDescription(f)}`);
        }
    }
    toJSON(toJson) {
        return subSchemaJson(this.subschema, toJson);
    }
}

class RegExpSchema extends BaseStringSchema {
    constructor(r) {
        super();
        this.r = r;
    }
    conformString(value) {
        return this.r.test(value) ? value : failure(`did not match ${this.r}`);
    }
    toJSON() {
        return Object.assign({}, super.toJSON(), { pattern: this.r.toString().replace(/^\//, '').replace(/\/$/, '') });
    }
}

class SelectSchema extends BaseSchema {
    constructor(path, subschema) {
        super();
        this.path = path;
        this.subschema = subschema;
    }
    ;
    conform(value) {
        if (typeof value !== 'object')
            return failure("expected an object");
        let target = value;
        let atPath = [];
        for (const key of this.path) {
            atPath.push(key);
            if (!(key in target))
                return failure("no value", atPath);
            target = target[key];
        }
        const result = this.subschema.conform(target);
        return result instanceof Problems
            ? result.prefixPath(this.path)
            : result;
    }
    toJSON() {
        throw new Error("Not implemented");
    }
}

class SetOfSchema extends BaseSchema {
    constructor(itemSchema) {
        super();
        this.itemSchema = itemSchema;
    }
    conform(value) {
        if (!(value instanceof Set || value instanceof Array))
            return failure(`${typeDescription(value)} was not an Array or a Set`);
        const entries = value instanceof Set ? value.entries() : value.map((v, i) => [i, v]);
        const conformed = new Set();
        let problems = new Problems([]);
        for (const [k, v] of entries) {
            const c = this.itemSchema.conform(v);
            if (c instanceof Problems)
                problems = problems.merge(c.prefixPath([k]));
            else
                conformed.add(c);
        }
        if (problems.length > 0)
            return problems;
        return conformed;
    }
    toJSON(toJson) {
        return {
            type: "array",
            items: subSchemaJson(this.itemSchema, toJson)
        };
    }
}

class UniqueSchema extends BaseSchema {
    constructor(keyfn) {
        super();
        this.keyfn = keyfn;
    }
    ;
    conform(value) {
        if (!(value instanceof Array))
            return failure(`${typeDescription(value)} was not an Array`);
        const countKeys = (m, t, i) => {
            const k = this.keyfn(t);
            if (!m.has(k))
                m.set(k, []);
            // @ts-ignore
            m.get(k).push(i);
            return m;
        };
        const keyCounts = value.reduce(countKeys, new Map());
        const p = [];
        for (const [k, indexes] of keyCounts.entries()) {
            if (indexes.length === 1)
                continue;
            const message = `duplicate at indexes: [${indexes}]`;
            const map = indexes.map((i) => problem(message, [i]));
            p.push(...map);
        }
        return p.length > 0 ? problems(...p) : value;
    }
    toJSON() {
        return {
            type: "array",
            description: "unique values"
        };
    }
}

class UrlSchema extends BaseStringSchema {
    constructor(opts) {
        super();
        this.opts = opts;
    }
    conformString(value) {
        if (validator.isURL(value, this.opts))
            return value;
        return failure(`not a valid url: ${value}`);
    }
    toJSON() {
        return Object.assign({}, super.toJSON(), { format: "url" });
    }
}

const REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
class UuidSchema extends RegExpSchema {
    constructor() {
        super(REGEX);
    }
    conformString(value) {
        const conformed = value.toLowerCase();
        return REGEX.test(conformed) ? conformed : failure(`not a valid uuid: ${value}`);
    }
    toJSON() {
        return Object.assign({}, super.toJSON(), { format: "uuid" });
    }
}

const SCHEMA_SYMBOL = Symbol('schema');
function schemaOf(ctor) {
    for (let search = ctor; search; search = Object.getPrototypeOf(search)) {
        const pd = Object.getOwnPropertyDescriptor(search, SCHEMA_SYMBOL);
        if (pd !== undefined)
            return pd.value;
    }
    throw new Error(`No schema on ${ctor.name}- not annotated with @data?`);
}
let SUSPEND_VALIDATION = false;
function suspendValidation(f) {
    try {
        SUSPEND_VALIDATION = true;
        return f();
    }
    finally {
        SUSPEND_VALIDATION = false;
    }
}
// TODO: add generic constraints to IN/OUT on Schema?
function hasSchema(schema) {
    return function (c) {
        const hackClassName = {};
        hackClassName[c.name] = class extends c {
            constructor(...args) {
                super(...args);
                if (SUSPEND_VALIDATION)
                    return;
                for (const [k, v] of Object.entries(this)) {
                    if (isSchema(v))
                        this[k] = undefined;
                }
                const conformed = schema.conformInPlace(this);
                if (conformed instanceof Problems) {
                    throw new ValidationError(this, conformed);
                }
            }
            ;
        };
        const decorated = hackClassName[c.name];
        Object.defineProperty(decorated, SCHEMA_SYMBOL, { value: schema, writable: false });
        return decorated;
    };
}

function schematizeEntries(object) {
    const fixed = {};
    for (const [k, v] of Object.entries(object)) {
        fixed[k] = schematize(v);
    }
    return fixed;
}
function schematize(x) {
    switch (typeof x) {
        case "string":
        case "number":
        case "boolean":
            return new EqualsSchema(x);
        case "object":
            const obj = x;
            if ('conform' in obj && typeof x['conform'] === "function")
                return x;
            else if (Object.getPrototypeOf(x) === Object.prototype)
                return new ObjectSchema(schematizeEntries(obj));
            else
                throw Error(`Cannot build schema from non-plain object ${Object.getPrototypeOf(x).name}`);
        default:
            throw Error(`Cannot build schema from ${typeof x}: ${x}`);
    }
}

function pathsEq(a, b) {
    return a.length === b.length
        && a.every((v, i) => v === b[i]);
}
function pathStartsWith(path, startsWith) {
    return path.length >= startsWith.length
        && startsWith.every((v, i) => v === path[i]);
}
function intertwingledValue(actual, problems, path) {
    if (isPrimitive(actual))
        return actual;
    // Arrays or objects
    const associative = wrapAssociative(actual);
    const keys = new Set(associative.keys());
    const missingKeys = problems.problems
        .filter(p => 
    // problems for direct children of path (but not ancestors)
    p.path.length === path.length + 1
        && pathStartsWith(p.path, path)
        // ...that are not in actual
        && !keys.has(p.path[-1]))
        .map(p => p.path[p.path.length - 1]);
    return [...keys, ...missingKeys]
        .reduce((result, k) => {
        result[k] = intertwingle(actual[k], problems, [...path, k]);
        return result;
    }, empty(actual));
}
/**
 * Returns an object in the same shape as actual, but with invalid values replaced with an error report.
 *
 * e.g.
 *
 * const actual = {right: 'right', wrong:'wrong'};
 * const problems = [{path: ['wrong'], message: 'error message'};
 * intertwingle(actual, problems);
 *
 * will return
 *
 * {right: 'right', wrong: {value: 'wrong', errors: ['error message']}}
 *
 * This is suitable for a structural diff with the actual value, where only
 * problem fields will be mismatches
 */
function intertwingle(actual, problems, path = []) {
    const myProblems = problems.problems
        .filter(p => pathsEq(path, p.path))
        .map(p => p.message);
    const intertwingled = intertwingledValue(actual, problems, path);
    return myProblems.length === 0
        ? intertwingled
        : myProblems.length === 1
            ? myProblems[0]
            : myProblems;
}
class ValidationError extends Error {
    constructor(actual, problems, { message = 'Validation failed', leakActualValuesInError = false, } = {}) {
        super(`${message}:\n${problems}${leakActualValuesInError ? `\nactual:${JSON.stringify(actual, null, 2)}\n` : ''}`);
        this.problems = problems;
        if (leakActualValuesInError) {
            this.actual = actual;
            this.expected = intertwingle(actual, problems, []);
        }
    }
}

const DEFAULT_BEHAVIOUR = {
    missing: MissingItemBehaviour.PROBLEM,
    unexpected: UnexpectedItemBehaviour.IGNORE,
    leakActualValuesInError: true,
};
/**
 * Conforms actual to the schema, or to the expected pattern using object();
 *
 * Returns the conformed value if successful.
 *
 * Otherwise throws an assertion Error, with actual, expected and showDiff, compatible with AssertionError, as used by
 * mocha, WebStorm, etc.
 *
 * The 'expected' field on the error will produce a usable diff with the actual value. See documentation on
 * intertwingle() for the shape of 'expected' on the error.
 */
function like(actual, expected, opts = {}) {
    const behaviour = Object.assign({}, DEFAULT_BEHAVIOUR, opts);
    const schema = patternItemToSchema(expected);
    const result = usingBehaviour(behaviour, () => conform(schema, actual));
    if (isError(result)) {
        throw new ValidationError(actual, result, {
            leakActualValuesInError: behaviour.leakActualValuesInError,
            message: opts.message
        });
    }
    return result;
}

class ConditionalSchema extends BaseSchema {
    constructor(matches) {
        super();
        this.matches = matches;
    }
    conform(value) {
        let problems = failure('could not match any case');
        for (const [case_, schema] of this.matches) {
            const matchResult = conform(case_, value);
            if (isSuccess(matchResult))
                return conform(schema, value);
            else
                problems = problems.merge(matchResult);
        }
        return problems;
    }
    case(case_, schema) {
        const caseSchema = isSchema(case_)
            ? case_
            : new BehaviourSchema({ unexpected: UnexpectedItemBehaviour.IGNORE }, new ObjectSchema(case_));
        return new ConditionalSchema([...this.matches, [caseSchema, schema]]);
    }
    toJSON(toJson) {
        if (this.matches.length === 0)
            return false;
        function subs(schema) {
            const result = subSchemaJson(schema, toJson);
            delete result['additionalProperties'];
            delete result['required'];
            delete result['type'];
            return result;
        }
        return this.matches
            .reverse()
            .reduce((result, [condition, schema]) => {
            return Object.assign({ if: subs(condition), then: subSchemaJson(schema, toJson) }, (result ? { else: result } : {}));
        }, undefined);
    }
}

function data(c) {
    // suspendValidation is required to allow calling parent constructor
    const objectWithDefaults = suspendValidation(() => new c());
    for (const [k, v] of Object.entries(objectWithDefaults)) {
        if (!(isSchema(v) || isPrimitive(v)))
            throw new Error(`Field '${k}' on ${c.name} is neither a schema nor a primitive value`);
    }
    const schema = new ObjectSchema(schematizeEntries(objectWithDefaults));
    return hasSchema(schema)(c);
}
function intersect(a, b) {
    const schema = schemaOf(a).intersect(schemaOf(b));
    let Intersection = class Intersection {
    };
    Intersection = __decorate([
        hasSchema(schema)
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
function makeInstance(c, obj) {
    return Object.assign(Object.create(c.prototype), obj);
}
function conformAs(c, obj) {
    const result = conform(schemaOf(c), obj);
    if (result instanceof Problems)
        return result;
    return makeInstance(c, result);
}
function build(c, values, opts = {}) {
    const conformed = usingBehaviour(opts, () => conformAs(c, values));
    if (conformed instanceof Problems) {
        throw new ValidationError(values, conformed, opts);
    }
    return conformed;
}
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
class DataSchema extends BaseSchema {
    constructor(c) {
        super();
        this.c = c;
        this.subSchema = schemaOf(c);
    }
    conform(value) {
        if (value instanceof this.c)
            return value;
        if (typeof value !== 'object')
            return failure(`Expected an object but got a ${typeof value}`);
        try {
            return build(this.c, value);
        }
        catch (e) {
            if (e instanceof ValidationError) {
                return e.problems;
            }
            throw e;
        }
    }
    toJSON(toJson) {
        return this.subSchema.toJSON(toJson);
    }
}

function identity(t) {
    return t;
}

function __(s) {
    return s.__();
}
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
    return new TagSchemaAsOptional(s);
}
function isdata(constructor) {
    return new DataSchema(constructor);
}
function partial(type) {
    return onMissing(schemaOf(type), MissingItemBehaviour.IGNORE);
}
function onMissing(schema, behaviour) {
    return withBehaviour(schema, { missing: behaviour });
}
function onUnexpected(schema, behaviour) {
    return withBehaviour(schema, { unexpected: behaviour });
}
function withBehaviour(schema, behaviour) {
    return new BehaviourSchema(behaviour, schema);
}
function deepNullablePattern(fieldSchemaArray) {
    const nullableFieldsObjectPattern = {};
    for (const [k, s] of fieldSchemaArray) {
        if ("fieldSchemaArray" in s) { // TODO testing if schema represents an object should be different
            const nullableFieldsObjectSchema = new ObjectSchema(deepNullablePattern(s.fieldSchemaArray));
            nullableFieldsObjectPattern[k] = new OrSchema([nullableFieldsObjectSchema, isnull()]);
        }
        else {
            nullableFieldsObjectPattern[k] = new OrSchema([s, isnull()]);
        }
    }
    return nullableFieldsObjectPattern;
}
function deepNullable(type) {
    const objectSchema = schemaOf(type);
    return new ObjectSchema(deepNullablePattern(objectSchema.fieldSchemaArray));
}
function eq(value) {
    return new EqualsSchema(value);
}
function gt(value) {
    return new NumberSchema({ exclusiveMinimum: value });
}
function lt(value) {
    return new NumberSchema({ exclusiveMaximum: value });
}
function gte(value) {
    return new NumberSchema({ minimum: value });
}
function lte(value) {
    return new NumberSchema({ maximum: value });
}
function range(from, to, { lowerInclusive = true, upperInclusive = false } = {}) {
    const min = lowerInclusive
        ? { minimum: from }
        : { exclusiveMinimum: from };
    const max = upperInclusive
        ? { maximum: to }
        : { exclusiveMaximum: to };
    return isnumber(Object.assign({}, min, max));
}
function isnull() {
    return eq(null);
}
function isobject() {
    return withBehaviour(new ObjectSchema({}), { unexpected: UnexpectedItemBehaviour.IGNORE });
}
function isundefined() {
    return eq(undefined);
}
function isany() {
    return schema((x) => x, () => true);
}
function fail(problems = failure('always fails')) {
    return schema(() => problems, () => false);
}
function arrayof(schema) {
    return new ArrayOfSchema(schema);
}
function setof(schema) {
    return new SetOfSchema(schema);
}
function enumvalue(e) {
    return new EnumValueSchema(e);
}
function enumkey(e) {
    const stringKeysOnly = {};
    for (let [k, v] of Object.entries(e)) {
        if (isNaN(Number(k)))
            stringKeysOnly[k] = v;
    }
    return lookup(stringKeysOnly);
}
function lookup(e) {
    return new LookupSchema(e);
}
function discriminated(...ctors) {
    return discriminatedBy(detectDiscriminator(ctors), ...ctors);
}
function discriminatedBy(discriminator, ...ctors) {
    return new DiscriminatedUnionSchema(ctors, discriminator);
}
function isstring() {
    return new StringSchema();
}
function isinstance(c) {
    return new IsInstanceSchema(c);
}
function matches(r) {
    return new RegExpSchema(r);
}
function conditional() {
    return new ConditionalSchema([]);
}
function isboolean() {
    return new BooleanSchema();
}
function isIn(...values) {
    return new InSchema(values);
}
function isurl(opts) {
    return new UrlSchema(opts || {});
}
function isuuid() {
    return new UuidSchema();
}
function isnumber(opts = {}) {
    return new NumberSchema(opts);
}
const DATE_TIME = new IsoUtcDateSchema(TimeExpectation.ALWAYS);
function isoUtcDateTime() {
    return DATE_TIME;
}
const DATE = new IsoUtcDateSchema(TimeExpectation.NEVER);
function isoDateOnly() {
    return DATE;
}
/**
 * E.164 phone number normaliser
 * if no default country is passed, it validates number depending on coutry calling code (has to begin with '+')
 */
function e164PhoneNumber(defaultCountryIso3166) {
    return new E164PhoneNumberSchema(defaultCountryIso3166);
}
function object(pattern) {
    return new ObjectSchema(pattern);
}
function deepPartial(pattern) {
    return onUnexpected(new ObjectSchema(pattern), UnexpectedItemBehaviour.IGNORE);
}
/**
 * An object where all values conform to schema
 */
function objof(schema) {
    return new ObjOfSchema(schema);
}
function map(entryPattern) {
    const subSchema = new ObjectSchema(entryPattern instanceof Map
        ? schematizeEntries(entryPattern)
        : entryPattern);
    return new MapSchema(subSchema);
}
function tuple(...s) {
    return new TupleSchema(s);
}
function schema(conform, toJSON) {
    return new DelegatingSchema(conform, toJSON);
}
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
    return schema((x) => predicate(x) === true ? x : failure(messageFn(x)));
}
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
    return new DeferredSchema(factory);
}
function override(s, o) {
    return new OverrideSchema(s, o);
}
function unique() {
    return uniqueBy(identity);
}
function uniqueBy(fn) {
    return new UniqueSchema(fn);
}
function select(path, s) {
    return new SelectSchema(path, s);
}
function anyOf(...items) {
    const result = items.reduce((result, item) => {
        const schema = isSchema(item) ? item : eq(item);
        return result ? result.or(schema) : schema;
    }, undefined);
    return result || fail(failure('oneOf() with no values provided'));
}
/**
 * Expects an object. Conforms value at path using schema, and returns the outer object.
 *
 * lens(["a", "b"], eq("valid")).conform({a:{b:"valid"}}) returns {a:{b:"valid"}}
 */
function lens(path, s) {
    return new LensSchema(path, s);
}
function defaultValue(value, schema) {
    return new DefaultValueSchema(value, schema);
}

export { patternItemToSchema, MissingItemBehaviour, UnexpectedItemBehaviour, Problem, Problems, isError, isSuccess, problem, problems, failure, __, opt, isdata, partial, onMissing, onUnexpected, withBehaviour, deepNullable, eq, gt, lt, gte, lte, range, isnull, isobject, isundefined, isany, fail, arrayof, setof, enumvalue, enumkey, lookup, discriminated, discriminatedBy, isstring, isinstance, matches, conditional, isboolean, isIn, isurl, isuuid, isnumber, isoUtcDateTime, isoDateOnly, e164PhoneNumber, object, deepPartial, objof, map, tuple, schema, predicate, defer, override, unique, uniqueBy, select, anyOf, lens, defaultValue, LensBehaviour, data, intersect, makeInstance, conformAs, build, construct, DataSchema, schematizeEntries, schematize, schemaOf, suspendValidation, hasSchema, validate, conform, like, analyseEnum, BaseSchema, AndSchema, OrSchema, BaseStringSchema, StringSchema, DelegatingSchema, isSchema, behaviour, usingBehaviour, BehaviourSchema, conformInPlace, optional, TagSchemaAsOptional, isOptional, MapSchema, objectEntries, patternToSchemas, ObjectStrategies, ObjectSchema, ObjOfSchema, TupleStrategies, TupleSchema, wrapAssociative, empty, DiscriminatedUnionSchema, detectDiscriminator, discriminatorReports, ArrayOfSchema, BooleanSchema, DefaultValueSchema, DeferredSchema, E164PhoneNumberSchema, EnumValueSchema, EqualsSchema, InSchema, IsInstanceSchema, TimeExpectation, IsoUtcDateSchema, setAtPath, LensSchema, LookupSchema, NumberSchema, OverrideSchema, RegExpSchema, SelectSchema, SetOfSchema, UniqueSchema, UrlSchema, UuidSchema, pathsEq, pathStartsWith, intertwingle, ValidationError, ConditionalSchema, subSchemaJson, jsonSchema };
//# sourceMappingURL=vice.es5.js.map
