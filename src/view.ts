import { Atom } from "./atom";

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

export function buildAtomSubTree(atom: Atom): HTMLElement {
    const template = document.createElement("template");
    template.innerHTML = atom.view.trim();
    console.log("SUBTREE", template.content.firstChild);
    return template.content.firstChild as HTMLElement;
}

export type ViewBuilder = ReturnType<typeof view>;
