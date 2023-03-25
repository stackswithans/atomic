/*@ts-ignore*/
import { getUniqueId } from "./utils";
import { ViewContext, ViewBuilder, buildAtomSubTree } from "./view";
import { Microscope, Subject, ObserveSpec } from "./event";
import { Electron } from "./orbit";

const liveAtoms: Record<string, Atom> = {};

type AtomAction = <T>(some: any) => T;

type AtomShape = {
    view: ViewBuilder;
    state?: Object;
    actions?: Record<string, AtomAction>;
};

interface Atom extends Microscope, Subject {
    atomId: string;
    instanceId: string;
    view: string;
    props: object;
    bindings: object;
    state: object;
    actions: Record<string, AtomAction>;
    _parent: Atom | null;
    subAtoms: Atom[];
    subTree: HTMLElement | null;
    on(event: string, handler: any): Atom;
    compile(ctx: ViewContext): string;
    viewBuilder: ViewBuilder;
    onMutation<T>(ref: Electron<T>): void;
}

const atomMicroscope = {
    observe(this: Atom, spec: ObserveSpec) {
        spec.target.addObserver(this, spec);
    },

    async onEvent(this: Atom, spec: ObserveSpec, details: any) {
        if (!spec.handler) {
            //If there is no handler, bubble events
            //this.notifyMicroscopes();
            return;
        }
        spec.handler({
            state: this.state,
            props: this.props,
            event: details,
        });
    },
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
            ctx.parent?.subAtoms.push(this);
            liveAtoms[this.instanceId] = this;
            this.subTree = buildAtomSubTree(this);
            console.log("this ran!!!");
            return this.view.trim();
        },
        _parent: null,
        viewBuilder: atomShape.view,
        subAtoms: [],
        subTree: null,
        ...atomMicroscope,
        addObserver(observer: Microscope, observeSpec: ObserveSpec): void {},
        prepare(): void {},
        onMutation<T>(ref: Electron<T>): void {
            //re-render
        },
    };
};

const atom = (atomShape: AtomShape) => {
    const atomId = getUniqueId("atom");

    return (props = {}) => {
        const instanceId = getUniqueId("instance");
        const newAtom = Atom(atomId, instanceId, atomShape, props);
        newAtom.view = atomShape.view({
            ctxAtom: newAtom,
            parent: newAtom._parent,
        });

        return newAtom;
    };
};

const getRenderedAtoms = () => liveAtoms;
export { atom, type Atom, getRenderedAtoms };
