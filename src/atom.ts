/*@ts-ignore*/
import { getUniqueId } from "./utils";
import {
    ViewContext,
    ViewBuilder,
    buildAtomSubTree,
    requestRender,
} from "./view";
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
    reRender: boolean;
    subTree: NodeListOf<ChildNode> | null;
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
        reRender: false,
        on(event, handler) {
            return this;
        },
        compile(ctx: ViewContext): string {
            this._parent = ctx.parent;
            ctx.parent?.subAtoms.push(this);
            liveAtoms[this.instanceId] = this;
            this.view = this.viewBuilder({
                parent: this,
                ctxAtom: this,
            });
            this.subTree = buildAtomSubTree(this);
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
            console.log("update pending");
            this.reRender = true;
            requestRender(this);
        },
    };
};

const atom = (atomShape: AtomShape) => {
    const atomId = getUniqueId("atom");

    return (props = {}) => {
        const instanceId = getUniqueId("instance");
        return Atom(atomId, instanceId, atomShape, props);
    };
};

const getRenderedAtoms = () => liveAtoms;
export { atom, type Atom, getRenderedAtoms };
