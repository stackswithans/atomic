import { Particle } from "./atom";
import { Electron } from "./electron";

type If = Particle & { thenNode: Node; elseNode: Node };

export const If = (
    cond: any,
    then: Particle,
    elseP: Particle | null = null
): If => {
    return {
        thenNode: null as unknown as Node,
        elseNode: null as unknown as Node,
        render(parent: HTMLElement) {
            //Comment used as empty node placeholder
            this.thenNode = then.render(parent);
            this.elseNode = elseP
                ? elseP.render(parent)
                : document.createComment("");
            if (cond instanceof Electron) {
                cond.observe((cond) => {
                    const newNode = cond ? this.thenNode : this.elseNode;
                    const oldNode = cond ? this.elseNode : this.thenNode;
                    parent.replaceChild(newNode, oldNode);
                });
                return cond.view() ? this.thenNode : this.elseNode;
            }
            return cond ? this.thenNode : this.elseNode;
        },
    };
};
