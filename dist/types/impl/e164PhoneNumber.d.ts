import { BaseSchema, ValidationResult } from "./";
export declare class E164PhoneNumberSchema extends BaseSchema<any, string> {
    private readonly defaultCountryIso3166?;
    constructor(defaultCountryIso3166?: string | undefined);
    conform(value: any): ValidationResult<string>;
    toJSON(): any;
}
