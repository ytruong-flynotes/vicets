import { BaseSchema, ValidationResult } from "./";
import { Constructor } from "./util/types";
export declare class IsInstanceSchema<T> extends BaseSchema<any, T> {
    private readonly c;
    constructor(c: Constructor<T>);
    conform(value: any): ValidationResult<T>;
    /**
     * This isn't really suitable for json schema,
     * which doesn't have the concept of a type
     */
    toJSON(): any;
}
