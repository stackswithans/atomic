import { Atom } from "./atom";

export type ViewContext = {
    parent: Atom;
};

type ViewParticle = {
    compile: (ctx: ViewContext) => string;
};

export const view = (viewParts: string[], ...particles: ViewParticle[]) => {
    return (ctx: ViewContext) => {
        viewParts = viewParts.map((str) => str.trim());
        const result = [viewParts[0]];
        let i = 0;
        for (const particle of particles) {
            result.push((particle.compile(ctx), viewParts[i + 1]));
            i++;
        }
        const builtView = result.join("");
        return builtView;
    };
};
