import { BaseStringSchema, ValidationResult } from "./";
export declare class RegExpSchema extends BaseStringSchema {
    private readonly r;
    constructor(r: RegExp);
    conformString(value: string): ValidationResult<string>;
    toJSON(): any;
}
