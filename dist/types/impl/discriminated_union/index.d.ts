import { BaseSchema } from "../";
import { Problems } from "../../problems";
import { Schema } from "../../schema";
import { Constructor } from "../util/types";
export declare class DiscriminatedUnionSchema<T extends object> extends BaseSchema<any, T> {
    private readonly ctors;
    private readonly discriminator;
    private readonly schemasByDiscriminatorValue;
    constructor(ctors: Constructor<T>[], discriminator: keyof T);
    conform(value: object): Problems | T;
    or<NEWIN extends any, NEWOUT>(that: Schema<any, NEWOUT>): Schema<any, T | NEWOUT>;
    private schemaFor;
    toJSON(toJson?: (s: Schema) => any): any;
}
