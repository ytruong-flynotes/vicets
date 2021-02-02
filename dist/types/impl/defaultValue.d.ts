import { BaseSchema, optional, Schema, ValidationResult } from "./";
export declare class DefaultValueSchema<T> extends BaseSchema<any, T> {
    private readonly value;
    private readonly subschema;
    [optional]: true;
    constructor(value: () => T, subschema: Schema<any, T>);
    conform(value: any): ValidationResult<T>;
    toJSON(toJson?: (s: Schema) => any): any;
}
