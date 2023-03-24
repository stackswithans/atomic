type AtomicEvent = string;
type AtomicEHandler = string;

type AtomicEContext = {
    domEvent: Event;
};

type Microscope = {
    _onChildAtomEvent(
        event: Event,
        handler: AtomicEHandler,
        data: AtomicEContext
    ): void;
    _onChildElementEvent(event, handler, data): void;
};

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
