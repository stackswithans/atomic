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

export function isTypePred<T>(obj: any, typeObj: Function): obj is T {
    return obj instanceof typeObj;
}

export function keyFilter<T extends Record<string, any>>(
    target: T,
    filter: (key: keyof T) => boolean
): Record<string, any> {
    return Object.keys(target)
        .filter(filter)
        .reduce((object: T, key: keyof T) => {
            object[key] = target[key];
            return object;
        }, {} as T);
}
