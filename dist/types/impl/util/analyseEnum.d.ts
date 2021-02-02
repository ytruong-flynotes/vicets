export declare enum EnumType {
    InitializedStrings = 0,
    InitializedIntegers = 1,
    Mixed = 2
}
export declare function analyseEnum<T>(e: T): {
    values: Set<any>;
    type: EnumType;
};
