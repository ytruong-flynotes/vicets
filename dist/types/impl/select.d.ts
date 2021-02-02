import { BaseSchema, Schema, ValidationResult } from "./";
export declare class SelectSchema<T> extends BaseSchema<any, T> {
    private readonly path;
    private readonly subschema;
    constructor(path: string[], subschema: Schema<any, T>);
    conform(value: any): ValidationResult<T>;
    toJSON(): any;
}
