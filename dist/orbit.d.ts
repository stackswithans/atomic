type Primitive<T> = string | number | object | boolean | undefined | null | T;
export type State = {
    [key: string]: Primitive<never>;
};
type Electron<T> = {
    _path: string;
    _data: T;
    [key: string]: Primitive<T>;
};
export type OrbitRefs<T> = Record<string, Electron<T>>;
type AtomicState = Omit<Primitive<State>, "object">;
export declare function view<T extends AtomicState>(ref: OrbitRefs<T>): T;
export declare function mutate<T extends AtomicState>(ref: OrbitRefs<T>, state: AtomicState): T;
export declare function useOrbit<T extends AtomicState>(initialState: T): OrbitRefs<T>;
export {};
