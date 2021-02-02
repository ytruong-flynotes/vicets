import { BaseSchema, ValidationResult } from "./";
export declare class InSchema<T extends number | string | null> extends BaseSchema<any, T> {
    private readonly values;
    constructor(values: T[]);
    conform(value: any): ValidationResult<T>;
    toJSON(): any;
}
