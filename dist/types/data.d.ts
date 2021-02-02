import { ObjectSchema, Problems, Schema, ValidationOpts, ValidationResult } from "./impl";
import { BaseSchema } from "./impl/core";
import { Constructor } from "./impl/util/types";
export declare function data<C extends Constructor>(c: C): C;
export declare function intersect<A extends object, B extends object>(a: Constructor<A>, b: Constructor<B>): Constructor<A & B>;
export declare function makeInstance<T>(c: Constructor<T>, obj: object): T;
export declare function conformAs<T extends object>(c: Constructor<T>, obj: object): ValidationResult<T>;
export declare function build<T extends object>(c: Constructor<T>, values: any, opts?: Partial<ValidationOpts>): T;
/**
 * Call this instead of build() when constructing data instances
 * by specifying fields in code. The compiler will complain if
 * fields are missing.
 *
 * `build(A, {})` will NOT cause the compiler to complain,
 * even if `{}` is missing fields `A` requires.
 *
 * `construct(A, {})` WILL cause the compiler to complain if
 * `{}` is missing fields `A` requires.
 */
export declare function construct<T extends object>(c: Constructor<T>, value: T, opts?: Partial<ValidationOpts>): T;
export declare class DataSchema<T extends object> extends BaseSchema<any, T> {
    private readonly c;
    readonly subSchema: Readonly<ObjectSchema<T>>;
    constructor(c: Constructor<T>);
    conform(value: any): Problems | T;
    toJSON(toJson?: (s: Schema) => any): any;
}
