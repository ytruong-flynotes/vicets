import { BaseSchema, Problems, Schema, ValidationResult } from "./";
export interface SchemaOverrides<IN, OUT> {
    failure?: string | ((value: IN) => Problems);
}
export declare class OverrideSchema<IN, OUT> extends BaseSchema<IN, OUT> {
    private readonly subschema;
    private readonly overrides;
    constructor(subschema: Schema<IN, OUT>, overrides: SchemaOverrides<IN, OUT>);
    conform(value: IN): ValidationResult<OUT>;
    private failure;
    toJSON(toJson?: (s: Schema) => any): any;
}
