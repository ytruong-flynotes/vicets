import { Constructor, PrimitiveValue } from "../util/types";
declare class DiscriminatorReport<T> {
    readonly problems: Map<keyof T, string>;
    readonly validFields: Map<keyof T, Map<PrimitiveValue, Constructor<T>>>;
    reject(k: keyof T, problem: string): this;
    accept(k: keyof T, mappings: Map<PrimitiveValue, Constructor<T>>): this;
}
export declare function detectDiscriminator<T extends object>(ctors: Constructor<T>[]): keyof T;
export declare function discriminatorReports<T extends object>(ctors: Constructor<T>[]): DiscriminatorReport<T>;
export {};
