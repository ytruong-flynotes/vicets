import { BaseSchema, ValidationResult } from "./";
export declare enum TimeExpectation {
    NEVER = "never",
    ALWAYS = "always",
    MAYBE = "maybe"
}
export declare class IsoUtcDateSchema extends BaseSchema<any, Date> {
    private readonly time;
    constructor(time: TimeExpectation);
    conform(value: any): ValidationResult<Date>;
    toJSON(): any;
}
