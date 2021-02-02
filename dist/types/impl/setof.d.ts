import { BaseSchema, Schema, ValidationResult } from "./";
export declare class SetOfSchema<T> extends BaseSchema<any, Set<T>> {
    private readonly itemSchema;
    constructor(itemSchema: Schema<any, T>);
    conform(value: any): ValidationResult<Set<T>>;
    toJSON(toJson?: (s: Schema) => any): any;
}
