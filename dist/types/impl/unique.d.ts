import { BaseSchema, ValidationResult } from "./";
export declare class UniqueSchema<T, V> extends BaseSchema<T[], T[]> {
    private readonly keyfn;
    constructor(keyfn: (t: T) => V);
    conform(value: any): ValidationResult<T[]>;
    toJSON(): any;
}
