/*@ts-ignore*/
import { getUniqueId, isType } from "./utils";
import * as protons from "./protons";
import { useOrbit } from "./orbit";
import * as DOMParticle from "./dom-particle";
import { Counter } from "./example";
/*
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
    const children: ChildNode[] = [];
    rootAtom.subTree?.forEach((child) => children.push(child));
    el.replaceWith(...children);
    //runAtomicEventSetup();
    //await createDataBindings(el, atomicCtx);
};*/
export { protons, useOrbit, Counter };
