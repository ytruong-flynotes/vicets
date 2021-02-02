import { BaseStringSchema, ValidationResult } from "./";
export interface IsURLOptions {
    protocols?: string[];
    require_tld?: boolean;
    require_protocol?: boolean;
    require_valid_protocol?: boolean;
    allow_underscores?: boolean;
    host_whitelist?: false | (string | RegExp)[];
    host_blacklist?: false | (string | RegExp)[];
    allow_trailing_dot?: boolean;
    allow_protocol_relative_urls?: boolean;
}
export declare class UrlSchema extends BaseStringSchema {
    private readonly opts;
    constructor(opts: IsURLOptions);
    conformString(value: string): ValidationResult<string>;
    toJSON(): any;
}
