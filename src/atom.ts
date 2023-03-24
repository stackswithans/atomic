/*@ts-ignore*/
import * as Handlebars from "../node_modules/handlebars/dist/handlebars";
import { getUniqueId } from "./utils";

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

    on(event: string, handler: any): Atom;
    //eventParticle: EventParticle;
    //_parentEventObservers: AtomObserver[];
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
        _parent: null,
    };
};

const atom = (atomShape: AtomShape) => {
    const atomId = getUniqueId("atom");

    return (props = {}) => {
        const instanceId = getUniqueId("instance");
        const newAtom = Atom(atomId, instanceId, atomShape, props);
        newAtom.view = atomShape.view(newAtom);
        //subAtoms.forEach((atom) => (atom._parent = newAtom));
        Handlebars.registerPartial(atomId, newAtom.view);
        return newAtom;
    };
};
export { atom, type Atom };
