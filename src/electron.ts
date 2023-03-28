import { isType, isObject, isTypePred } from "./utils";
import { Particle } from "./atom";

type Primitive<T> = string | number | object | boolean | undefined | null | T;

export type State = {
    [key: string]: Primitive<never>;
};

type onMutation<T> = (newVal: T) => void;

export class Electron<T> {
    private _observers: onMutation<T>[] = [];
    private _data: T;
    [key: string]: Primitive<T>;

    view(): T {
        return this._data;
    }

    mutate(mutation: T | ((oldState: T) => T)): T {
        let newVal: T;
        if (isTypePred<Function>(mutation, Function)) {
            newVal = mutation(this._data);
        } else {
            newVal = mutation;
        }
        this._data = newVal;
        this._observers.forEach((onMutation) => {
            onMutation(newVal);
        });
        return newVal;
    }

    observe(fn: onMutation<T>): void {
        this._observers.push(fn);
    }

    constructor(data: T) {
        this._data = data;
    }
}

const makeElectron = <T>(data: T): Electron<T> => new Electron(data);

export type OrbitRefs<T> = Record<string, Electron<T>>;

function makeElectronsFromObject<T>(
    electronRoot: OrbitRefs<T>,
    currentRootPath: string,
    currentRootObj: T
) {
    const electron = makeElectron(currentRootObj);

    electronRoot[currentRootPath] = electron;
    if (!isObject(currentRootObj)) {
        return;
    }
    for (const key in currentRootObj) {
        const path = currentRootPath + "." + key;
        electronRoot[currentRootPath][key] = makeElectron(currentRootObj[key]);

        if (isType(currentRootObj[key], "object")) {
            makeElectronsFromObject(
                electronRoot,
                path,
                currentRootObj[key] as any
            );
        }
    }
}

export function createElectron<T>(initialState: T) {
    const orbitRootKey = "__root";
    if (!isType(initialState, "object")) {
        return makeElectron(initialState);
    }
    const electrons: OrbitRefs<T> = {};
    makeElectronsFromObject(electrons, orbitRootKey, initialState);
    return electrons.__root;
}

export function reactive<T extends Object>(electron: Electron<T>): Particle {
    return {
        render(parent: HTMLElement) {
            //We are certain that we are a text node because of the context
            //in which we are used
            const textNode = document.createTextNode(
                electron.view().toString()
            );
            electron.observe(
                (newVal: T) => (textNode.textContent = newVal.toString())
            );
            return textNode;
        },
    };
}

export const reactiveTransform = (content: any) =>
    content instanceof Electron ? reactive(content) : null;
