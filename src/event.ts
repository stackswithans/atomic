type AtomicEvent = string;
type AtomicEHandler = string;

type AtomicEContext = {
    domEvent: Event;
};

type EHandler = <T>(some: any) => T;

let activeSubjects: Subject[] = [];

export const registerSubject = (subject: Subject) =>
    activeSubjects.push(subject);

export type ObserveSpec = {
    target: Subject;
    event: string;
    handler: EHandler | null;
};

export interface Subject {
    addObserver(observer: Microscope, observeSpec: ObserveSpec): void;
    prepare(): void;
}

export interface Microscope {
    observe(observeSpec: ObserveSpec): void;
    onEvent(observeSpec: ObserveSpec, details: any): Promise<void>;
}
export function clearOldSubjects() {
    activeSubjects = [];
}

export function runAtomicEventSetup() {
    activeSubjects.forEach((subject) => subject.prepare());
}

/*
const callEventHandler = async (atom, handler, data) => {
    // Allow for inline function handlers
    if (!(handler in atom.actions)) {
        throw new Error(`the action ${handler} does not exist on the atom`);
    }
    const state = atom._electron.access();
    const setState = atom._electron.setData.bind(atom._electron);

    await atom.actions[handler]({
        state,
        setState,
        eventData: data,
    });
};

const bubbleEvent = async (atom, event, data) => {
    //If there is no handler, bubble events
    for (const observer of atom._parentEventObservers) {
        if (observer.event !== event) continue;
        await atom._parent._onChildAtomEvent(event, observer.handler, data);
        return;
    }
};

const createEventBindings = async (rootEl, appContext) => {
    const emittingElements = [...rootEl.querySelectorAll("[data-atomic-on]")];

    emittingElements.forEach((element) => {
        const { event, instanceId, handler } = JSON.parse(
            element.getAttribute("data-atomic-on")
        );
        element.addEventListener(event, async (e) => {
            await appContext.__globalCtx[instanceId]._onChildElementEvent(
                event,
                handler,
                {
                    el: element,
                    atom: appContext.__globalCtx[instanceId],
                    domEvent: e,
                }
            );
        });
    });
};

async function _onChildAtomEvent(event, handler, data) {
    if (!handler) {
        //If there is no handler, bubble events
        bubbleEvent(this, event, data);
        return;
    }
    if (typeof handler === "function") {
        console.error("Have not yet implemented function handlers");
        return;
    }
    // TODO: Allow for inline function handlers
    callEventHandler(this, handler, data);
}

async function _onChildElementEvent(event, handler, data) {
    if (!handler) {
        //If there is no handler, bubble events
        bubbleEvent(this, event, data);
        return;
    }
    await callEventHandler(this, handler, data);
}
*/
