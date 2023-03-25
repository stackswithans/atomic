import { ViewContext, ViewParticle } from "./view";

export const on = (event: string, handler: string): ViewParticle => {
    const onParticle = {
        event,
        handler,
        compile(ctx: ViewContext): string {
            const atom = ctx.ctxAtom;
            const event = this.event;
            const onDef = {
                event: this.event,
                atom: atom.instanceId,
                handler,
            };
            console.log(onDef);

            return ` data-atomic-on='${JSON.stringify(onDef)}'`;
        },
    };
    return onParticle;
};
