import { StrictPattern } from "./impl";
import { Schema } from "./schema";
export declare type Schemaish = Schema<any, any> | Function | number | string | boolean | object;
export declare function schematizeEntries<T extends object>(object: Object): StrictPattern<T>;
export declare function schematize<IN, OUT>(x: Schemaish): Schema<IN, OUT>;
