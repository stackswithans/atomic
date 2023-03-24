type AtomicEvent = string;
type AtomicEHandler = string;
type AtomicEContext = {
    domEvent: Event;
};
type Microscope = {
    _onChildAtomEvent(event: Event, handler: AtomicEHandler, data: AtomicEContext): void;
    _onChildElementEvent(event: any, handler: any, data: any): void;
};
declare const callEventHandler: (atom: any, handler: any, data: any) => Promise<void>;
declare const bubbleEvent: (atom: any, event: any, data: any) => Promise<void>;
declare const createEventBindings: (rootEl: any, appContext: any) => Promise<void>;
declare function _onChildAtomEvent(event: any, handler: any, data: any): Promise<void>;
declare function _onChildElementEvent(event: any, handler: any, data: any): Promise<void>;
