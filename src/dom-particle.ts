import { isTypePred, isType } from "./utils";
import { Proton, on } from "./protons";
import { useOrbit, Electron, reactiveTransform } from "./orbit";
import { Particle, Atom } from "./atom";

const CONTENTKEY = "content";

type HTMLAttributes = Record<string, string | boolean>;

interface DOMParticle extends Particle {
    el: string;
    attrs: HTMLAttributes;
    node: Node | null;
    content: Particle | Particle[];
    protons: Record<string, Proton>;
    mount(selector: string): void;
}

const plainText = (anything: any): string => `${anything}`;

const setAttrs = (el: HTMLElement, attrs: HTMLAttributes) => {
    Object.keys(attrs).forEach((key) => {
        el.setAttribute(key, attrs[key].toString());
    });
};

/*
const siblings = (atoms: Atom[]): Atom => {
    return {
        el: "SIBLING",
    };
};*/

const text = (content: any): Particle => {
    return {
        render: (parent: HTMLElement): Node =>
            document.createTextNode(plainText(content)),
    };
};

const extractValidAttrs = (
    data: Record<string, any>
): Record<string, string | boolean> => {
    return Object.keys(data)
        .filter(
            (key) =>
                (key !== CONTENTKEY && typeof data[key] === "string") ||
                typeof data[key] === "boolean"
        )
        .reduce((object: Record<string, any>, key) => {
            object[key] = data[key];
            return object;
        }, {});
};

const isValidProtonSpec = (data: any) => {
    return (
        isType(data, "function") ||
        (data instanceof Array && data.every((val) => isType(val, "function")))
    );
};

const extractProtons = (data: Record<string, any>): Record<string, Proton> => {
    return Object.keys(data)
        .filter((key) => isValidProtonSpec(data[key]))
        .reduce((object: Record<string, any>, key) => {
            object[key] = data[key];
            return object;
        }, {});
};

const textTransform = (content: any): Particle | Particle[] | null => {
    return typeof content["render"] !== "function" &&
        !isTypePred<Array<any>>(content, Array)
        ? text(content)
        : null;
};

const activateProtons = (el: HTMLElement, protons: Record<string, Proton>) => {
    for (const protonKey in protons) {
        const protonOrProtonList = protons[protonKey];
        if (protonOrProtonList instanceof Array) {
            protonOrProtonList.forEach((proton) => proton(el));
            continue;
        }
        protons[protonKey](el);
    }
};

type Transform = (content: any) => Particle | Particle[] | null;

function runContentTransforms(
    content: any,
    transforms: Transform[]
): Particle | Particle[] {
    for (const transform of transforms) {
        const result = transform(content);
        if (result) {
            return result;
        }
    }
    return content;
}

const makeGenericDOMParticleFn = (el: string) => {
    return (data: Record<string, any>): DOMParticle => {
        let content = runContentTransforms(data.content, [
            reactiveTransform,
            textTransform,
        ]);
        let attrs = extractValidAttrs(data);
        let protons = extractProtons(data);

        console.log(protons);

        return {
            el,
            attrs: attrs ? attrs : {},
            content,
            protons,
            node: null,
            render(parent: HTMLElement | null): Node {
                const elNode = document.createElement(el);
                if (isTypePred<Array<Particle>>(this.content, Array)) {
                    this.content.forEach((child) => {
                        elNode.appendChild(child.render(elNode));
                    });
                } else {
                    elNode.appendChild(this.content.render(elNode));
                }
                setAttrs(elNode, this.attrs);
                this.node = elNode;
                activateProtons(elNode, this.protons);
                return elNode;
            },
            mount(selector: string) {
                const atomTree = this.render(null);
                const mountPoint = document.querySelector(selector);
                mountPoint?.replaceWith(atomTree);
            },
        };
    };
};

export const div = makeGenericDOMParticleFn("div");
export const h1 = makeGenericDOMParticleFn("h1");
export const h2 = makeGenericDOMParticleFn("h2");
export const h3 = makeGenericDOMParticleFn("h3");
export const h4 = makeGenericDOMParticleFn("h4");
export const h5 = makeGenericDOMParticleFn("h5");
export const h6 = makeGenericDOMParticleFn("h6");
export const button = makeGenericDOMParticleFn("button");
/*
const Counter = {
    div: {
        div: [
            {
                h1: {
                    attr: "hello",
                    _: count.view(),
                },
            },
            {
                button: ["increment", "decrement"],
            },
        ],
    },
};

console.log(buildAtomTree("root", Counter, 0));
const Counter = div({
    of: div({

    })
})
*/

const count = useOrbit(0);
let intervalId: ReturnType<typeof setInterval> | null = null;

const CounterBtn = (props: Record<string, any>): Particle => {
    return button({
        "in-background-color": props.bgColor,
        "in-color": "white",
        "in-padding": "1em 2em",
        "in-border-radius": "20px",
        content: props.text,
        on: on("click", props.onClick),
    });
};

export const Counter = div({
    "in-width": "100%",
    "in-height": "100%",
    "in-display": "flex",
    "in-background-color": "black",
    "in-color": "white",
    "in-justify-content": "center",
    "in-align-items": "center",
    "in-flex-direction": "column",
    "in-gap": "1em",
    content: [
        h4({
            content: "Counter",
        }),
        div({
            "in-margin-bottom": "1rem",
            content: h1({ content: count }),
        }),
        div({
            "in-display": "flex",
            "in-gap": "1.5em",
            content: [
                CounterBtn({
                    text: "Start",
                    bgColor: "green",
                    onClick: () => {
                        setInterval;
                        intervalId = setInterval(
                            () => count.mutate((count) => count + 1),
                            1000
                        );
                    },
                }),
                CounterBtn({
                    text: "Stop",
                    bgColor: "red",
                    onClick: () => {
                        if (!intervalId) return;
                        clearInterval(intervalId);
                        intervalId = null;
                    },
                }),
                CounterBtn({
                    text: "Reset",
                    bgColor: "blue",
                    onClick: () => {
                        if (intervalId) {
                            clearInterval(intervalId);
                            intervalId = null;
                        }
                        count.mutate(0);
                    },
                }),
                /*
                button({
                    "in-background-color": "red",
                    "in-color": "white",
                    "in-padding": "1em",
                    "in-margin-right": "1em",
                    "in-border-radius": "20px",
                    content: "Start",
                    on: on("click", () => {
                        count.mutate((count) => count + 1);
                    }),
                }),
                button({
                    "in-padding": "1em",
                    content: "Stop",
                    on: on("click", () => {
                        count.mutate((count) => count - 1);
                    }),
                })*/
                ,
            ],
        }),
    ],
});

/*
export const mountAtom = (selector: string, atom: Atom) => {
    const atomTree = atom.render();
    const mountPoint = document.querySelector(selector);
    mountPoint?.replaceWith(atomTree);
};*/
