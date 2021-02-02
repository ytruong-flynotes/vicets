import { BaseSchema, Schema, ValidationResult } from "../";
export declare class ObjOfSchema<T> extends BaseSchema<any, {
    [k: string]: T;
}> {
    private readonly valueSchema;
    constructor(valueSchema: Schema<any, T>);
    conform(value: any): ValidationResult<{
        [p: string]: T;
    }>;
    toJSON(toJson?: (s: Schema) => any): any;
}
