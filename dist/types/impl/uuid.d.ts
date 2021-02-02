import { RegExpSchema, ValidationResult } from "./";
export declare class UuidSchema extends RegExpSchema {
    constructor();
    conformString(value: string): ValidationResult<string>;
    toJSON(): any;
}
