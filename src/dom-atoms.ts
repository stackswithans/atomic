import { isTypePred, isType } from "./utils";
import { Proton, on } from "./protons";

const CONTENTKEY = "content";

type HTMLAttributes = Record<string, string | boolean>;

interface Atom {
    render(): Node;
}

interface DOMAtom extends Atom {
    el: string;
    attrs: HTMLAttributes;
    subTree: Node | null;
    content: Atom[] | Atom;
    protons: Record<string, Proton>;
    mount(selector: string): void;
}

const plainText = (anything: any): string => `${anything}`;

const renderContent = (content: any): Node => {
    if (typeof content["render"] !== "function") {
        return document.createTextNode(plainText(content));
    } else {
        return content.render();
    }
};

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
        render: (): Node => document.createTextNode(plainText(content)),
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

const extractProtons = (data: Record<string, any>): Record<string, Proton> => {
    return Object.keys(data)
        .filter((key) => typeof data[key] === "function")
        .reduce((object: Record<string, any>, key) => {
            object[key] = data[key];
            return object;
        }, {});
};

const convertInvalidContent = (content: any): Atom | Atom[] => {
    return typeof content["render"] !== "function" &&
        !isTypePred<Array<any>>(content, Array)
        ? text(content)
        : content;
};

const activateProtons = (el: HTMLElement, protons: Record<string, Proton>) => {
    for (const protonKey in protons) {
        protons[protonKey](el);
    }
};

const makeGenericDOMAtomFn = (el: string) => {
    return (data: Record<string, any>): DOMAtom => {
        let content = convertInvalidContent(data.content);
        let attrs = extractValidAttrs(data);
        let protons = extractProtons(data);

        console.log(protons);

        return {
            el,
            attrs: attrs ? attrs : {},
            content,
            protons,
            subTree: null,
            render(): Node {
                const elNode = document.createElement(el);

                if (isTypePred<Array<Atom>>(this.content, Array)) {
                    this.content.forEach((child) => {
                        elNode.appendChild(child.render());
                    });
                } else {
                    elNode.appendChild(this.content.render());
                }
                setAttrs(elNode, this.attrs);
                this.subTree = elNode;
                activateProtons(elNode, this.protons);
                return elNode;
            },
            mount(selector: string) {
                const atomTree = this.render();
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
export const counter = div({
    "in-width": "100%",
    "in-height": "100%",
    "in-display": "flex",
    "in-justify-content": "center",
    "in-align-items": "center",
    "in-flex-direction": "column",
    content: [
        div({
            "in-margin-bottom": "1rem",
            content: h1({ content: 0 }),
        }),
        div({
            content: [
                button({
                    "in-padding": "1em",
                    "in-margin-right": "1em",
                    content: "increment",
                    on: on("click", () => {
                        console.log("increment");
                    }),
                }),
                button({
                    "in-padding": "1em",
                    content: "decrement",
                    on: on("click", () => {
                        console.log("decrement");
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
