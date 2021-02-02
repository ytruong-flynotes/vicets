export declare type Path = any[];
export declare class Problem {
    readonly path: Path;
    readonly message: string;
    constructor(path: Path, message: string);
    prefixPath(p: Path): Problem;
    toString(): string;
}
export declare class Problems {
    readonly problems: Problem[];
    constructor(problems: Problem[]);
    readonly length: number;
    prefixPath(p: Path): Problems;
    merge(...ps: Problems[]): Problems;
    append(...ps: Problem[]): Problems;
    toString(): string;
}
export declare function isError(x: ValidationResult<any>): x is Problems;
export declare function isSuccess<T>(x: ValidationResult<T>): x is T;
export declare function problem(message: string, path?: Path): Problem;
export declare function problems(...ps: Problem[]): Problems;
export declare function failure(message: string, path?: Path): Problems;
export interface ValidationErrorOpts {
    readonly message: string;
    readonly leakActualValuesInError: boolean;
}
export declare type ValidationResult<T> = Problems | T;
