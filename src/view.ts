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
        //viewParts = viewParts.map((str) => str.trim());
        const result = [viewParts[0]];
        let i = 0;
        for (const particle of particles) {
            console.log("compile result", particle.compile(ctx));
            result.push(particle.compile(ctx), viewParts[i + 1]);
            i++;
        }
        const builtView = result.join("");
        console.log("build result", builtView);
        return builtView;
    };
};

export type ViewBuilder = ReturnType<typeof view>;
