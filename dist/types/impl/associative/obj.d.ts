import { Associative, BaseSchema, Pattern, PatternItem, Schema, ValidationResult } from "../";
export declare function objectEntries(object: object): [string, Schema][];
export declare function patternItemToSchema<T>(item: PatternItem<T>): Schema;
export declare function patternToSchemas<T extends object>(pattern: Pattern<T>): {
    [K in keyof T]: Schema<T[K]>;
};
export declare class ObjectStrategies implements Associative<string, any> {
    readonly result: any;
    constructor(result: any);
    set(k: any, v: any): this;
    delete(k: any): boolean;
    has(k: any): boolean;
    get(k: any): any;
    keys(): Iterable<string>;
}
export declare class ObjectSchema<T extends object> extends BaseSchema<any, T> {
    readonly pattern: Pattern<T>;
    readonly fieldSchemaArray: [string, Schema][];
    constructor(pattern: Pattern<T>);
    conform(value: any): ValidationResult<T>;
    /**
     * Required to allow @hasSchema to conform 'this'
     */
    conformInPlace(instance: {}): ValidationResult<{}>;
    intersect<U extends object>(other: ObjectSchema<U>): ObjectSchema<T & U>;
    toJSON(toJson?: (s: Schema) => any): any;
}
