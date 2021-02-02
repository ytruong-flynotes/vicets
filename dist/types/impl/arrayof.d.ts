import { BaseSchema, Schema, ValidationResult } from "./";
export declare class ArrayOfSchema<T> extends BaseSchema<any[], T[]> {
    private readonly itemSchema;
    constructor(itemSchema: Schema<any, T>);
    conform(value: any): ValidationResult<T[]>;
    toJSON(toJson?: (s: Schema) => any): any;
}
