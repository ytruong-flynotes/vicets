import { BaseSchema, ValidationResult } from "./";
export declare class BooleanSchema extends BaseSchema<any, boolean> {
    conform(value: any): ValidationResult<boolean>;
    toJSON(): any;
}
