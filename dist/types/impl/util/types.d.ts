export declare type PrimitiveValue = string | number | boolean;
export declare function isPrimitive(value: any): boolean;
export declare function unsafeCast<T>(x: any): T;
export declare function typeDescription(x: any): string;
export declare type Constructor<T = any> = new (...args: any[]) => T;
