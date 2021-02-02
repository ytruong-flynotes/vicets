import { Pattern, Schema, ValidationOpts } from "./impl";
export declare type Likeable = Array<any> | object;
/**
 * Conforms actual to the schema, or to the expected pattern using object();
 *
 * Returns the conformed value if successful.
 *
 * Otherwise throws an assertion Error, with actual, expected and showDiff, compatible with AssertionError, as used by
 * mocha, WebStorm, etc.
 *
 * The 'expected' field on the error will produce a usable diff with the actual value. See documentation on
 * intertwingle() for the shape of 'expected' on the error.
 */
export declare function like<T extends Likeable>(actual: any, expected: Pattern<T> | Schema<any, T>, opts?: Partial<ValidationOpts>): T;
