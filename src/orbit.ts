import { isType, isObject } from "./utils";

const orbitRootKey = "__root";

type Primitive<T> = string | number | object | boolean | undefined | null | T;

export type State = {
    [key: string]: Primitive<never>;
};

type Electron<T> = {
    _path: string;
    _data: T;
    [key: string]: Primitive<T>;
};

function makeElectron<T>(path: string, data: T): Electron<T> {
    return { _path: path, _data: data };
}

export type OrbitRefs<T> = Record<string, Electron<T>>;

type AtomicState = Omit<Primitive<State>, "object">;

class Orbit<T extends AtomicState> {
    private _electrons: OrbitRefs<T>;

    constructor(initialState: T) {
        if (!isType(initialState, "object")) {
            throw new Error("Orbit initial state must be an object");
        }
        this._electrons = {};
        this._buildRefs(orbitRootKey, initialState);
    }

    private _buildRefs(currentRootPath: string, currentRootObj: T) {
        const electron = makeElectron(currentRootPath, currentRootObj);

        this._electrons[currentRootPath] = electron;
        if (!isObject(currentRootObj)) {
            return;
        }
        for (const key in currentRootObj) {
            const path = currentRootPath + key;
            this._electrons[currentRootPath][key] = makeElectron(
                path,
                currentRootObj[key]
            );

            if (isType(currentRootObj[key], "object")) {
                this._buildRefs(path, currentRootObj[key] as any);
            }
        }
    }

    getElectrons(): OrbitRefs<T> {
        return this._electrons;
    }
}

export function view<T extends AtomicState>(ref: OrbitRefs<T>): T {}

export function mutate<T extends AtomicState>(
    ref: OrbitRefs<T>,
    state: AtomicState
): T;

export function mutate<T extends AtomicState>(
    ref: OrbitRefs<T>,
    state: AtomicState | ((oldState: AtomicState) => AtomicState)
): T {}

export function useOrbit<T extends AtomicState>(initialState: T) {
    const orbit = new Orbit(initialState);
    return orbit.getElectrons();
}
