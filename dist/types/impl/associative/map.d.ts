import { BaseSchema, ObjectSchema, Schema, ValidationResult } from "../";
export declare class MapSchema<K, V> extends BaseSchema<any, Map<K, V>> {
    private readonly subSchema;
    constructor(subSchema: ObjectSchema<any>);
    conform(value: any): ValidationResult<Map<K, V>>;
    toJSON(toJson?: (s: Schema) => any): any;
}
