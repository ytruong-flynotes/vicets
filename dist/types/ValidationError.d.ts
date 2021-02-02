import { Path, Problems, ValidationErrorOpts } from "./impl";
export declare function pathsEq(a: Path, b: Path): boolean;
export declare function pathStartsWith(path: Path, startsWith: Path): boolean;
/**
 * Returns an object in the same shape as actual, but with invalid values replaced with an error report.
 *
 * e.g.
 *
 * const actual = {right: 'right', wrong:'wrong'};
 * const problems = [{path: ['wrong'], message: 'error message'};
 * intertwingle(actual, problems);
 *
 * will return
 *
 * {right: 'right', wrong: {value: 'wrong', errors: ['error message']}}
 *
 * This is suitable for a structural diff with the actual value, where only
 * problem fields will be mismatches
 */
export declare function intertwingle(actual: any, problems: Problems, path?: Path): any;
export declare class ValidationError extends Error {
    readonly problems: Problems;
    readonly actual?: any;
    readonly expected?: any;
    constructor(actual: any, problems: Problems, { message, leakActualValuesInError, }?: Partial<ValidationErrorOpts>);
}
