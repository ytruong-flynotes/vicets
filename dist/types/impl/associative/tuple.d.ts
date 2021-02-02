import { Associative, BaseSchema, Schema, ValidationResult } from "../";
export declare class TupleStrategies<T extends any[]> implements Associative<number, any> {
    private readonly resultIn;
    private readonly deleted;
    constructor(resultIn: T);
    readonly result: T;
    set(k: number, v: any): this;
    has(k: number): boolean;
    get(k: number): any;
    delete(k: number): boolean;
    keys(): Iterable<number>;
}
export declare class TupleSchema<T extends any[]> extends BaseSchema<T> {
    private readonly itemSchemas;
    constructor(schemas: Schema[]);
    conform(value: any): ValidationResult<T>;
    toJSON(toJson?: (s: Schema) => any): any;
}
