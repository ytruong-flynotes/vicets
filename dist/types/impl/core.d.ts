import { Problems, ValidationResult } from "../problems";
import { Schema } from "../schema";
export declare abstract class BaseSchema<IN = any, OUT = any> implements Schema<IN, OUT> {
    or<NEWOUT>(s: Schema<IN, NEWOUT>): Schema<IN, OUT | NEWOUT>;
    and<NEWOUT>(s: Schema<OUT, NEWOUT>): Schema<IN, NEWOUT>;
    __<FAKED extends OUT>(): FAKED;
    abstract conform(value: IN): ValidationResult<OUT>;
    abstract toJSON(toJson?: (s: Schema) => any): any;
}
export declare class AndSchema<IN, OUT> extends BaseSchema<IN, OUT> {
    private readonly subSchemas;
    constructor(subSchemas: Schema[]);
    conform(value: IN): ValidationResult<OUT>;
    and<NEWOUT>(s: Schema<OUT, NEWOUT>): Schema<IN, NEWOUT>;
    toJSON(toJson?: (s: Schema) => any): {
        allOf: any;
    };
}
export declare class OrSchema<IN, OUT> extends BaseSchema<IN, OUT> {
    private readonly subSchemas;
    constructor(subSchemas: Schema<IN, OUT>[]);
    conform(value: IN): ValidationResult<OUT>;
    or<NEWOUT>(s: Schema<IN, NEWOUT>): Schema<IN, OUT | NEWOUT>;
    toJSON(toJson?: (s: Schema) => any): {
        anyOf: any;
    };
}
export declare abstract class BaseStringSchema extends BaseSchema<any, string> {
    conform(value: any): ValidationResult<string>;
    abstract conformString(value: string): ValidationResult<string>;
    toJSON(): any;
}
export declare class StringSchema extends BaseStringSchema {
    conformString(value: string): ValidationResult<string>;
}
export declare class DelegatingSchema<IN, OUT> extends BaseSchema<IN, OUT> {
    private readonly delegatedConform;
    readonly toJSON: () => any;
    constructor(delegatedConform: (value: IN) => Problems | OUT, toJSON?: () => any);
    conform(value: IN): ValidationResult<OUT>;
}
export declare function isSchema(value: any): value is Schema;
