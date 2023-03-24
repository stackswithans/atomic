/*@ts-ignore*/
import * as Handlebars from "../node_modules/handlebars/dist/handlebars";
import { getUniqueId, isType } from "./utils";

const __globalCtx = {};

class Electron {
    constructor(initialState) {
        this.data = Object.freeze(initialState);
        this.observers = [];
    }

    access(subscription = null) {
        if (subscription !== null) {
            this.observers.push(subscription);
        }
        return this.data;
    }

    setData(setter) {
        this.data = typeof setter === "function" ? setter(this.data) : setter;
        this.observers.forEach((observer) => {
            observer(this.data);
        });
        return this.data;
    }
}

const refHandler = {
    _activeRefs: {},
    get(target, prop, receiver) {
        if (!Reflect.has(target, prop)) return undefined;
        if (prop in this._activeRefs) return this._activeRefs[prop];
        this._activeRefs[prop] = new Electron(target[prop]);

        console.log("THIS IN PROXY", this);
        return this._activeRefs[prop];
    },
};

const createBond = (initialState) => {
    if (!isType(initialState, "object")) {
        return Electron(initialState);
    }
    return new Proxy(initialState, refHandler);
};

Handlebars.registerHelper("on", function (event, handler) {
    const { __instanceId } = this;
    handler = typeof handler === "string" ? handler : null;

    return new Handlebars.SafeString(
        `data-atomic-on=${JSON.stringify({
            event,
            instanceId: __instanceId,
            handler,
        })}`
    );
});

const isAtom = (particle) => particle.atomId && particle.instanceId;
const isBinding = (particle) => particle._type === "BINDING";

const renderBinding = (particle, ctxAtom) => {
    particle.atom = ctxAtom.instanceId;
    const bindId = getUniqueId("bind");
    const bindData = JSON.stringify({
        bindId,
        atom: particle.atom,
    });
    ctxAtom.bindings[bindId] = particle;
    return ` data-atomic-bind=${bindData} `;
};

const view = (viewParts, ...particles) => {
    return (ctxAtom) => {
        viewParts = viewParts.map((str) => str.trim());
        const result = [viewParts[0]];
        const subAtoms = [];
        let i = 0;
        for (const particle of particles) {
            if (!isAtom(particle) && !isBinding(particle)) {
                throw new Error(
                    "view tag only supports particle substitutions"
                );
            }
            if (isAtom(particle)) {
                result.push(renderAtom(particle), viewParts[i + 1]);
                subAtoms.push(particle);
                particle._parent = ctxAtom;
            }
            if (isBinding(particle))
                result.push(renderBinding(particle, ctxAtom), viewParts[i + 1]);
            i++;
        }
        const builtView = result.join("");
        ctxAtom.subAtoms = subAtoms;
        return builtView;
    };
};

const bubbleEvent = async (atom, event, data) => {
    //If there is no handler, bubble events
    for (const observer of atom._parentEventObservers) {
        if (observer.event !== event) continue;
        await atom._parent._onChildAtomEvent(event, observer.handler, data);
        return;
    }
};

const resolveState = async (state) => {
    if (typeof state === "function") {
        const resolvedState = await state();
        if (!isType(resolvedState, "object"))
            throw new Error("State must be an object");
        return new Electron(resolvedState);
    }
    return typeof state === "object"
        ? new Electron(structuredClone(state))
        : new Electron({});
};

const renderAtom = (atom: Atom) => {
    const { instanceId, atomId } = atom;
    __globalCtx[atom.instanceId] = atom;
    return `{{> ${atomId} __globalCtx.${instanceId}.state}}`;
};

const getAppContext = async () => {
    for (const key in __globalCtx) {
        const atom = __globalCtx[key];
        const electron = await resolveState(atom.state);

        atom.state = {
            ...electron.access(),
            ...atom.props,
        };
        //Make context available to inner atoms
        atom.state.__globalCtx = __globalCtx;
        atom.state.__instanceId = atom.instanceId;
        atom._electron = electron;
    }
    return {
        __globalCtx,
    };
};

const createDataBindings = async (rootEl, appContext) => {
    const boundControls = [
        ...rootEl.querySelectorAll("input[data-atomic-bind]"),
    ];

    boundControls.forEach((element) => {
        console.log(element.getAttribute("data-atomic-bind"));
        const { bindId, atom } = JSON.parse(
            element.getAttribute("data-atomic-bind")
        );

        console.log("BINDING", element, bindId, atom);

        element.addEventListener("input", async (event) => {
            const atomObj = appContext.__globalCtx[atom];
            const bindInfo = atomObj.bindings[bindId];
            bindInfo.bond.setData(event.target.value);
        });
    });
};

const createEventBindings = async (rootEl, appContext) => {
    const emittingElements = [...rootEl.querySelectorAll("[data-atomic-on]")];

    emittingElements.forEach((element) => {
        const { event, instanceId, handler } = JSON.parse(
            element.getAttribute("data-atomic-on")
        );
        element.addEventListener(event, async (e) => {
            await appContext.__globalCtx[instanceId]._onChildElementEvent(
                event,
                handler,
                {
                    el: element,
                    atom: appContext.__globalCtx[instanceId],
                    domEvent: e,
                }
            );
        });
    });
};

export const initAtomic = async (selectorOrEl: string | HTMLElement, atom) => {
    let el = selectorOrEl;
    if (typeof selectorOrEl === "string")
        el = document.querySelector(selectorOrEl) as HTMLElement;
    if (!(el instanceof HTMLElement)) {
        throw new Error("Invalid selector or element");
    }
    const mainAtom = Handlebars.compile(renderAtom(atom));
    const atomicCtx = await getAppContext();
    el.innerHTML = mainAtom(atomicCtx);
    await createEventBindings(el, atomicCtx);
    await createDataBindings(el, atomicCtx);
};
