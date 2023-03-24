/*@ts-ignore*/
import * as Handlebars from "../node_modules/handlebars/dist/handlebars";
import { getUniqueId, isType } from "./utils";

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
        return new Electron(resolvedState);
    }
    return typeof state === "object"
        ? new Electron(structuredClone(state))
        : new Electron({});
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
