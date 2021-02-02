import { BaseSchema, Problems, Schema } from "../";
export interface Associative<K, V> {
    set(k: K, v: V): this;
    delete(k: K): boolean;
    has(k: K): boolean;
    get(k: K): any;
    keys(): Iterable<K>;
}
export declare function conformInPlace<K, V>(thing: Associative<K, V>, itemSchemas: Iterable<[K, Schema]>): Problems | undefined;
export declare const optional: unique symbol;
export declare class TagSchemaAsOptional<IN, OUT> extends BaseSchema<IN, OUT | undefined> {
    private readonly subschema;
    [optional]: boolean;
    constructor(subschema: Schema<IN, OUT>);
    conform(value: IN): Problems | OUT | undefined;
    toJSON(toJson?: (s: Schema) => any): any;
}
export declare function isOptional(schema: Schema): boolean;
export declare type StrictPatternItem<T> = StrictPattern<T> | Schema<any, T> | T;
export declare type StrictPattern<T> = {
    readonly [K in keyof T]: StrictPatternItem<T[K]>;
};
export declare type PatternItem<T> = Pattern<T> | Schema<any, T> | T;
export declare type Pattern<T> = {
    readonly [K in keyof T]?: PatternItem<T[K]>;
};
