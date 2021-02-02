import { BaseSchema, Schema, ValidationResult } from "./";
export declare class DeferredSchema<IN, OUT> extends BaseSchema<IN, OUT> {
    private readonly deferred;
    private _subschema;
    constructor(deferred: () => Schema<IN, OUT>);
    private readonly subschema;
    conform(value: IN): ValidationResult<OUT>;
    toJSON(toJson?: (s: Schema) => any): any;
}
