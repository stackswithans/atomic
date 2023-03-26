import { Atom } from "./atom";
import { runAtomicEventSetup, clearOldSubjects } from "./event";

export type ViewContext = {
    ctxAtom: Atom;
    parent: Atom | null;
};

export type ViewParticle = {
    compile: (ctx: ViewContext) => string;
};

export const view = (viewParts: string[], ...particles: ViewParticle[]) => {
    return (ctx: ViewContext) => {
        viewParts = viewParts.map((str) => str.trim());
        const result = [viewParts[0]];
        let i = 0;
        for (const particle of particles) {
            const viewMarkup = particle.compile(ctx);
            result.push(viewMarkup, viewParts[i + 1]);
            i++;
        }

        const builtView = result.join("");
        //console.log("build result", builtView);
        return builtView;
    };
};

export function buildAtomSubTree(atom: Atom): NodeListOf<ChildNode> {
    const template = document.createElement("template");
    template.innerHTML = atom.view.trim();
    const children = [...template.content.children];
    children.forEach((child) => {
        console.log("in here");
        child.setAttribute(`data-atomic-atom`, atom.instanceId);
    });
    return template.content.childNodes;
}

export function requestRender(atom: Atom) {
    //Clear old event handlers
    clearOldSubjects();

    const newAtomView = atom.compile({ parent: atom, ctxAtom: atom });

    const oldElements = document.querySelectorAll(
        `*[data-atomic-atom=${atom.instanceId}]`
    );

    //Add new elements html
    const anchor = oldElements[0];
    atom.subTree?.forEach((el) => {
        anchor.parentNode?.append(el);
    });

    //Remove old elements
    oldElements.forEach((el) => el.remove());

    runAtomicEventSetup();

    atom.reRender = false;
}

export type ViewBuilder = ReturnType<typeof view>;
