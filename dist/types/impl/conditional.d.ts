import { BaseSchema, Pattern, Schema, ValidationResult } from "../impl";
export declare class ConditionalSchema<IN extends object, OUT, MATCH = any> extends BaseSchema<IN, OUT> {
    private readonly matches;
    constructor(matches: [Schema<IN>, Schema<IN, OUT>][]);
    conform(value: IN): ValidationResult<OUT>;
    case<OTHER extends object>(case_: Pattern<OTHER> | Schema<IN, any>, schema: Schema<IN, OTHER>): ConditionalSchema<IN, OUT | OTHER>;
    toJSON(toJson?: (s: Schema) => any): any;
}
