import { BaseSchema, ValidationResult } from "./";
export interface Opts {
    minimum?: number;
    exclusiveMinimum?: number;
    maximum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;
}
export declare class NumberSchema extends BaseSchema<any, number> {
    private readonly opts;
    constructor(opts: Opts);
    conform(value: any): ValidationResult<number>;
    toJSON(): any;
}
