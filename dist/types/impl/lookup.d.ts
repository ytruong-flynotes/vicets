import { BaseSchema, ValidationResult } from "./";
export declare class LookupSchema<T extends object, V> extends BaseSchema<any, T[keyof T]> {
    private readonly lookup;
    constructor(lookup: T);
    conform(value: any): ValidationResult<T[keyof T]>;
    toJSON(): any;
}
