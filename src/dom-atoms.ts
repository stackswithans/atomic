import { isTypePred, isType } from "./utils";
import { Proton, on } from "./protons";
import { useOrbit, Electron, reactiveTransform } from "./orbit";

const CONTENTKEY = "content";

type HTMLAttributes = Record<string, string | boolean>;

export interface Atom {
    render(parent: HTMLElement | null): Node;
}

interface DOMAtom extends Atom {
    el: string;
    attrs: HTMLAttributes;
    node: Node | null;
    content: Atom[] | Atom;
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

const text = (content: any): Atom => {
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

const textTransform = (content: any): Atom | Atom[] | null => {
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

type Transform = (content: any) => Atom | Atom[] | null;

function runContentTransforms(
    content: any,
    transforms: Transform[]
): Atom | Atom[] {
    for (const transform of transforms) {
        const result = transform(content);
        if (result) {
            return result;
        }
    }
    return content;
}

const makeGenericDOMAtomFn = (el: string) => {
    return (data: Record<string, any>): DOMAtom => {
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
                if (isTypePred<Array<Atom>>(this.content, Array)) {
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

export const div = makeGenericDOMAtomFn("div");
export const h1 = makeGenericDOMAtomFn("h1");
export const button = makeGenericDOMAtomFn("button");
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

export const Counter = div({
    "in-width": "100%",
    "in-height": "100%",
    "in-display": "flex",
    "in-justify-content": "center",
    "in-align-items": "center",
    "in-flex-direction": "column",
    content: [
        div({
            "in-margin-bottom": "1rem",
            content: h1({ content: count }),
        }),
        div({
            content: [
                button({
                    "in-padding": "1em",
                    "in-margin-right": "1em",
                    content: "increment",
                    on: on("click", () => {
                        count.mutate((count) => count + 1);
                    }),
                }),
                button({
                    "in-padding": "1em",
                    content: "decrement",
                    on: on("click", () => {
                        count.mutate((count) => count - 1);
                    }),
                }),
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
