import { Schema, SchemaDefinitions } from "./schema";
export declare function subSchemaJson(schema: Schema | Schema[], toJson?: (s: Schema) => any): any;
export interface JsonSchemaOpts {
    id?: string;
    definitions: SchemaDefinitions;
}
export declare function jsonSchema(opts: JsonSchemaOpts): {
    $schema: string;
    definitions: object;
} | {
    $schema: string;
    definitions: object;
} | {
    $schema: string;
    definitions: object;
    id: string;
};
