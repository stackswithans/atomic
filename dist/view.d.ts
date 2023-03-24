import { Atom } from "./atom";
export type ViewContext = {
    parent: Atom;
};
type ViewParticle = {
    compile: (ctx: ViewContext) => string;
};
export declare const view: (viewParts: string[], ...particles: ViewParticle[]) => (ctx: ViewContext) => string;
export {};
