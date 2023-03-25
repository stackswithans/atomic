import { ViewContext, ViewParticle } from "./view";
import { getUniqueId } from "./utils";
import { Microscope, ObserveSpec, Subject, registerSubject } from "./event";

const genAtomicTagForElement = (id: string): string => {
    return ` data-atomic-id='${id}' `;
};

interface ElementSubject extends Subject {
    observers: Array<{ observer: Microscope; spec: ObserveSpec }>;
    element: HTMLElement;
}

const ElementSubject = (elementId: string): ElementSubject => ({
    observers: [] as Array<any>,
    element: null as unknown as HTMLElement,
    addObserver(observer: Microscope, spec: ObserveSpec): void {
        this.observers.push({ observer, spec });
    },
    prepare(): void {
        this.element = document.querySelector(
            `*[${genAtomicTagForElement(elementId)}]`
        ) as HTMLElement;

        this.observers.forEach((sub) => {
            this.element.addEventListener(sub.spec.event, (e) => {
                sub.observer.onEvent(sub.spec, e);
            });
        });
    },
});

export const on = (
    event: string,
    handler: string | null = null
): ViewParticle => {
    const onParticle = {
        event,
        handler,
        compile(ctx: ViewContext): string {
            const target = getUniqueId("element");
            const atom = ctx.ctxAtom;
            const subject = ElementSubject(target);
            registerSubject(subject);
            atom.observe({
                target: subject,
                event: this.event,
                handler: handler ? atom.actions[handler] : null,
            });

            return genAtomicTagForElement(target);
        },
    };
    return onParticle;
};
