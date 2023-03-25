var counters = new Map();

const typeOf = (obj: Object) => typeof obj;

export const getUniqueId = (prefix: string): string => {
    if (!counters.has(prefix)) counters.set(prefix, 0);
    const nextId = counters.get(prefix);
    counters.set(prefix, nextId + 1);
    return `${prefix}_${nextId}`;
};

export function isType(obj: any, typeStr: ReturnType<typeof typeOf>): boolean {
    return typeof obj === typeStr;
}

export function isObject(obj: any): obj is object {
    return typeof obj === "object";
}

export function isTypePred<T>(
    obj: any,
    typeStr: ReturnType<typeof typeOf>
): obj is T {
    return typeof obj === typeStr;
}
