export declare function addGetter<T, K extends keyof T>(obj: T, k: K, getter: () => T[K]): T;
export declare type GetterMapper<A, B extends {
    [K in keyof A]: B[K];
}> = <K extends keyof A>(original: A, mapped: B, k: K) => () => B[K];
export declare function mapGetters<A, B extends {
    [K in keyof A]: B[K];
}>(original: A, mapper: GetterMapper<A, B>): B;
export declare function copyGetters<T>(original: T): T;
export declare function merge<A extends object, B extends object>(a: A, b: B, conflictFn: (a: any, b: any) => any): A & B;
