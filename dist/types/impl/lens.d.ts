import { BaseSchema, Schema, ValidationResult } from "./";
export declare function setAtPath<T>(obj: T, path: string[], value: any): T;
export declare class LensSchema<T, U> extends BaseSchema<any, T> {
    private readonly path;
    private readonly subschema;
    constructor(path: string[], subschema: Schema<any, U>);
    conform(value: any): ValidationResult<T>;
    toJSON(): any;
}
export declare enum LensBehaviour {
    MODIFY_IN_PLACE = "modify-in-place"
}
