/*@ts-ignore*/
//import * as Handlebars from "../node_modules/handlebars/dist/handlebars";
import { getUniqueId, isType } from "./utils";
import { atom, Atom, getRenderedAtoms } from "./atom";
import { view } from "./view";
import { on } from "./protons";
import { useOrbit } from "./orbit";
import { runAtomicEventSetup } from "./event";

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

const resolveState = async (state) => {
    if (typeof state === "function") {
        const resolvedState = await state();
        if (!isType(resolvedState, "object"))
            throw new Error("State must be an object");
        return resolvedState;
    }
    return typeof state === "object" ? structuredClone(state) : {};
};

/*
const getAppContext = async () => {
    const renderedAtoms = getRenderedAtoms();
    const appCtx = {};
    for (const key in renderedAtoms) {
        const atom = renderedAtoms[key];
        const state = await resolveState(atom.state);
        appCtx[atom.instanceId] = {
            state: {
                ...state,
                ...atom.props,
                __appCtx: appCtx,
            },
        };
    }
    return {
        __appCtx: appCtx,
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
*/

const initAtomic = async (
    selectorOrEl: string | HTMLElement,
    rootAtom: Atom
) => {
    let el = selectorOrEl;
    if (typeof selectorOrEl === "string")
        el = document.querySelector(selectorOrEl) as HTMLElement;
    if (!(el instanceof HTMLElement)) {
        throw new Error("Invalid selector or element");
    }

    const view = rootAtom.compile({ parent: null, ctxAtom: rootAtom });
    console.log("rootAtom:", view);
    el.replaceWith(rootAtom.subTree as HTMLElement);
    setTimeout(() => runAtomicEventSetup(), 100);
    //await createDataBindings(el, atomicCtx);
};
export { initAtomic, atom, view, on, useOrbit };
