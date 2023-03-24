declare const typeOf: (obj: Object) => "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
export declare const getUniqueId: (prefix: string) => string;
export declare function isType(obj: any, typeStr: ReturnType<typeof typeOf>): boolean;
export declare function isObject(obj: any): obj is object;
export {};
