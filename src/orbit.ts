import { isType, isObject, isTypePred } from "./utils";
import { ViewContext } from "./view";
import { Atom } from "./dom-atoms";

const orbitRootKey = "__root";

type Primitive<T> = string | number | object | boolean | undefined | null | T;

export type State = {
    [key: string]: Primitive<never>;
};

type onMutation<T> = (newVal: T) => void;

export class Electron<T> {
    private _observers: onMutation<T>[] = [];
    private _path: string;
    private _data: T;
    [key: string]: Primitive<T>;

    compile(ctx: ViewContext): string {
        //Do not add subscription if it is a reRender
        if (!ctx.ctxAtom.reRender)
            this.observe(() => ctx.ctxAtom.onMutation(this));
        return `${this.view()}`;
    }
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
            console.log("NOTIFYING SUBSCRIBERS");
            onMutation(newVal);
        });
        return newVal;
    }

    observe(fn: onMutation<T>): void {
        console.log("SUBSCRIBED");
        this._observers.push(fn);
    }

    constructor(path: string, data: T) {
        this._path = path;
        this._data = data;
    }
}

const makeElectron = <T>(path: string, data: T): Electron<T> =>
    new Electron(path, data);

export type OrbitRefs<T> = Record<string, Electron<T>>;

type AtomicState = Omit<Primitive<State>, "object">;

class Orbit<T> {
    private _electrons: OrbitRefs<T>;

    constructor(initialState: T) {
        this._electrons = {};
        if (!isType(initialState, "object")) {
            const electron = makeElectron(orbitRootKey, initialState);
            this._electrons[orbitRootKey] = electron;
            return;
        }
        this._buildRefs(orbitRootKey, initialState);
    }

    private _buildRefs(currentRootPath: string, currentRootObj: T) {
        const electron = makeElectron(currentRootPath, currentRootObj);

        this._electrons[currentRootPath] = electron;
        if (!isObject(currentRootObj)) {
            return;
        }
        for (const key in currentRootObj) {
            const path = currentRootPath + "." + key;
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

export function useOrbit<T>(initialState: T) {
    const orbit = new Orbit(initialState);
    return orbit.getElectrons().__root;
}

export function reactive<T extends Object>(electron: Electron<T>): Atom {
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
