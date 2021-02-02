import { Behaviour, Schema, ValidationResult } from "./impl";
export interface ValidationOpts extends Behaviour {
    message: string;
}
export declare function validate<IN, OUT>(schema: Schema<IN, OUT>, value: IN, opts?: Partial<ValidationOpts>): OUT;
export declare function conform<IN, OUT>(schema: Schema<IN, OUT>, value: IN, opts?: Partial<ValidationOpts>): ValidationResult<OUT>;
