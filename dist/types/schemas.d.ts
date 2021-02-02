import { Behaviour, ConditionalSchema, IsURLOptions, MissingItemBehaviour, Opts, OverrideSchema, Pattern, Problems, Schema, SchemaOverrides, StrictPattern, UnexpectedItemBehaviour } from "./impl";
import { Constructor } from "./impl/util/types";
export declare function __<IN, OUT>(s: Schema<IN, OUT>): OUT;
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
export declare function opt<IN, OUT>(s: Schema<any, OUT>): Schema<any, OUT | undefined>;
export declare function isdata<T extends object>(constructor: Constructor<T>): Schema<any, T>;
export declare function partial<T extends object>(type: Constructor<T>): Schema<any, Partial<T>>;
export declare function onMissing<IN, OUT>(schema: Schema<IN, OUT>, behaviour: MissingItemBehaviour): Schema<IN, OUT>;
export declare function onUnexpected<IN, OUT>(schema: Schema<IN, OUT>, behaviour: UnexpectedItemBehaviour): Schema<IN, OUT>;
export declare function withBehaviour<IN, OUT>(schema: Schema<IN, OUT>, behaviour: Partial<Behaviour>): Schema<IN, OUT>;
export declare function deepNullable<T extends object>(type: Constructor<T>): Schema<any, DeepNullable<T>>;
export declare type Nullable<T> = T | null;
export declare type DeepNullable<T extends object> = {
    [P in keyof T]: T[P] extends object ? DeepNullable<T[P]> : Nullable<T[P]>;
};
export declare function eq<T>(value: T): Schema<any, T>;
export declare function gt(value: number): Schema<any, number>;
export declare function lt(value: number): Schema<any, number>;
export declare function gte(value: number): Schema<any, number>;
export declare function lte(value: number): Schema<any, number>;
export interface RangeOpts {
    lowerInclusive: boolean;
    upperInclusive: boolean;
}
export declare function range(from: number, to: number, { lowerInclusive, upperInclusive }?: Partial<RangeOpts>): Schema<any, number>;
export declare function isnull(): Schema<any, null>;
export declare function isobject(): Schema<any, object>;
export declare function isundefined(): Schema<any, undefined>;
export declare function isany(): Schema<any, any>;
export declare function fail(problems?: Problems): Schema<any, any>;
export declare function arrayof<T>(schema: Schema<any, T>): Schema<any, T[]>;
export declare function setof<T>(schema: Schema<any, T>): Schema<any, Set<T>>;
export declare function enumvalue<T extends object>(e: T): Schema<any, T[keyof T]>;
export declare function enumkey<T extends object>(e: T): Schema<any, T[keyof T]>;
export declare function lookup<T extends object>(e: T): Schema<any, T[keyof T]>;
export declare function discriminated<T extends object>(...ctors: Constructor<T>[]): Schema<any, T>;
export declare function discriminatedBy<T extends object>(discriminator: keyof T, ...ctors: Constructor<T>[]): Schema<any, T>;
export declare function isstring(): Schema<any, string>;
export declare function isinstance<T>(c: Constructor<T>): Schema<any, T>;
export declare function matches(r: RegExp): Schema<any, string>;
export declare function conditional(): ConditionalSchema<any, any>;
export declare function isboolean(): Schema<any, boolean>;
export declare function isIn<T extends number | string | null>(...values: T[]): Schema<any, T>;
export declare function isurl(opts?: IsURLOptions): Schema<any, string>;
export declare function isuuid(): Schema<any, string>;
export declare function isnumber(opts?: Opts): Schema<any, number>;
export declare function isoUtcDateTime(): Schema<any, Date>;
export declare function isoDateOnly(): Schema<any, Date>;
/**
 * E.164 phone number normaliser
 * if no default country is passed, it validates number depending on coutry calling code (has to begin with '+')
 */
export declare function e164PhoneNumber(defaultCountryIso3166?: string): Schema<any, string>;
export declare function object<T extends object>(pattern: StrictPattern<T>): Schema<any, T>;
export declare function deepPartial<T extends object>(pattern: Pattern<T>): Schema<any, T>;
/**
 * An object where all values conform to schema
 */
export declare function objof<T>(schema: Schema<any, T>): Schema<any, {
    [k: string]: T;
}>;
export declare function map<K, V>(entryPattern: Pattern<{}> | Map<K, Schema<any, V>>): Schema<any, Map<K, V>>;
export declare function tuple<A>(a: Schema<any, A>): Schema<any, [A]>;
export declare function tuple<A, B>(a: Schema<any, A>, b: Schema<any, B>): Schema<any, [A, B]>;
export declare function tuple<A, B, C>(a: Schema<any, A>, b: Schema<any, B>, c: Schema<any, C>): Schema<any, [A, B, C]>;
export declare function tuple<A, B, C, D>(a: Schema<any, A>, b: Schema<any, B>, c: Schema<any, C>, d: Schema<any, D>): Schema<any, [A, B, C, D]>;
export declare function tuple<A, B, C, D, E>(a: Schema<any, A>, b: Schema<any, B>, c: Schema<any, C>, d: Schema<any, D>, e: Schema<any, E>): Schema<any, [A, B, C, D, E]>;
export declare function tuple<T extends any[]>(...s: Schema[]): Schema<any, T>;
export declare function schema<IN, OUT>(conform: (value: IN) => Problems | OUT, toJSON?: () => any): Schema<IN, OUT>;
export declare function predicate<T>(predicate: (value: T) => boolean, failureMessage?: ((value: any) => string) | string): Schema<T, T>;
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
export declare function defer<IN, OUT>(factory: () => Schema<IN, OUT>): Schema<IN, OUT>;
export { SchemaOverrides } from "./impl/override";
export declare function override<IN, OUT>(s: Schema<IN, OUT>, o: SchemaOverrides<IN, OUT>): OverrideSchema<IN, OUT>;
export declare function unique<T>(): Schema<any, T[]>;
export declare function uniqueBy<T, V = any>(fn: (t: T) => V): Schema<T[], T[]>;
export declare function select<T>(path: string[], s: Schema<any, T>): Schema<any, T>;
export declare function anyOf<T>(...items: (T | Schema<any, T>)[]): Schema<any, T>;
export { LensBehaviour } from './impl/lens';
/**
 * Expects an object. Conforms value at path using schema, and returns the outer object.
 *
 * lens(["a", "b"], eq("valid")).conform({a:{b:"valid"}}) returns {a:{b:"valid"}}
 */
export declare function lens<T, U>(path: string[], s: Schema<any, U>): Schema<any, T>;
export declare function defaultValue<T>(value: () => T, schema: Schema<any, T>): Schema<any, T>;
