import { ViewContext } from "./view";
type AtomShape = {
    view: (atom: Atom) => string;
    state?: Object;
    actions?: Object;
};
type Atom = {
    atomId: string;
    instanceId: string;
    view: string;
    props: object;
    bindings: object;
    state: object;
    actions: object;
    _parent: Atom | null;
    subAtoms: Atom[];
    on(event: string, handler: any): Atom;
    compile(ctx: ViewContext): string;
};
declare const Atom: (atomId: string, instanceId: string, atomShape: AtomShape, props: object) => Atom;
declare const atom: (atomShape: AtomShape) => (props?: {}) => Atom;
export { atom, type Atom };
