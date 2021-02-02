import { BaseSchema, ValidationResult } from "./";
export declare class EnumValueSchema<T extends object> extends BaseSchema<any, T[keyof T]> {
    private readonly e;
    private readonly enumValues;
    private readonly enumType;
    private failureMessage;
    constructor(e: T);
    conform(value: any): ValidationResult<T[keyof T]>;
    toJSON(): any;
}
