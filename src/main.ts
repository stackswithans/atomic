/*@ts-ignore*/
import * as Handlebars from "../node_modules/handlebars/dist/handlebars";
import { getUniqueId, isType } from "./utils";
import { atom, Atom, getRenderedAtoms } from "./atom";
import { view } from "./view";

const __globalCtx = {};

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

const resolveState = async (state) => {
    if (typeof state === "function") {
        const resolvedState = await state();
        if (!isType(resolvedState, "object"))
            throw new Error("State must be an object");
        return resolvedState;
    }
    return typeof state === "object" ? structuredClone(state) : {};
};

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

const initAtomic = async (selectorOrEl: string | HTMLElement, atom: Atom) => {
    let el = selectorOrEl;
    if (typeof selectorOrEl === "string")
        el = document.querySelector(selectorOrEl) as HTMLElement;
    if (!(el instanceof HTMLElement)) {
        throw new Error("Invalid selector or element");
    }

    const mainAtom = Handlebars.compile(atom.compile({ parent: atom }));
    const atomicCtx = await getAppContext();
    el.innerHTML = mainAtom(atomicCtx);
    const newRoot = el.children[0];
    el.replaceWith(newRoot);
    await createEventBindings(el, atomicCtx);
    await createDataBindings(el, atomicCtx);
};
export { initAtomic, atom, view };
