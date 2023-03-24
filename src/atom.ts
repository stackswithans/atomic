/*@ts-ignore*/
import * as Handlebars from "../node_modules/handlebars/dist/handlebars";
import { getUniqueId } from "./utils";
import { ViewContext } from "./view";

const liveAtoms: Record<string, Atom> = {};

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
    //eventParticle: EventParticle;
    //_parentEventObservers: AtomObserver[];
};

const compileAtom = (atom: Atom): string => {
    const { atomId } = atom;
    liveAtoms[atom.instanceId] = atom;
    return `{{> ${atomId} __appCtx.${atom.instanceId}.state}}`;
};

const Atom = (
    atomId: string,
    instanceId: string,
    atomShape: AtomShape,
    props: object
): Atom => {
    return {
        atomId,
        instanceId,
        view: "",
        state: atomShape.state ? atomShape.state : {},
        actions: atomShape.actions ? atomShape.actions : {},
        props,
        bindings: {},
        on(event, handler) {
            return this;
        },
        compile(ctx: ViewContext): string {
            this._parent = ctx.parent;
            return compileAtom(this);
        },
        _parent: null,
        subAtoms: [],
    };
};

const atom = (atomShape: AtomShape) => {
    const atomId = getUniqueId("atom");
    let atomIsRegistered = false;

    return (props = {}) => {
        const instanceId = getUniqueId("instance");
        const newAtom = Atom(atomId, instanceId, atomShape, props);
        newAtom.view = atomShape.view(newAtom);
        if (!atomIsRegistered) {
            Handlebars.registerPartial(atomId, newAtom.view);
            atomIsRegistered = true;
        }

        return newAtom;
    };
};

const getRenderedAtoms = () => liveAtoms;
export { atom, type Atom, getRenderedAtoms };
