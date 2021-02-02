import { ObjectSchema } from "./impl";
import { Constructor } from "./impl/util/types";
export declare function schemaOf<T extends object>(ctor: Constructor<T>): ObjectSchema<T>;
export declare function suspendValidation<T>(f: () => T): T;
export declare function hasSchema<C extends {
    new (...args: any[]): object;
}>(schema: ObjectSchema<C>): (c: C) => C;
