/*@ts-ignore*/
import { getUniqueId, isType } from "./utils";
import { atom, Atom } from "./atom";
import { view } from "./view";
import { on } from "./protons";
import { useOrbit } from "./orbit";
import { runAtomicEventSetup } from "./event";
import * as DOMAtoms from "./dom-atoms";

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
    runAtomicEventSetup();
    //await createDataBindings(el, atomicCtx);
};
export { initAtomic, atom, view, on, useOrbit, DOMAtoms };
