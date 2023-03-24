var counters = new Map();

const typeOf = (obj: Object) => typeof obj;

export const getUniqueId = (prefix: string): string => {
    if (!counters.has(prefix)) counters.set(prefix, 0);
    const nextId = counters.get(prefix);
    counters.set(prefix, nextId + 1);
    return `${prefix}_${nextId}`;
};

export function isType<T>(obj: T, typeStr: ReturnType<typeof typeOf>): boolean {
    return typeof obj === typeStr;
}
