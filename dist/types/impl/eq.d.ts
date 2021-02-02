import { BaseSchema, ValidationResult } from "./";
export declare class EqualsSchema<T> extends BaseSchema<any, T> {
    readonly expected: T;
    constructor(expected: T);
    conform(value: any): ValidationResult<T>;
    toJSON(): object;
}
