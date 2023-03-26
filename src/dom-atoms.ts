import { isTypePred, isType } from "./utils";

type HTMLAttributes = Record<string, string>;

interface Atom {
    render(): Node;
}

interface DOMAtom extends Atom {
    el: string;
    attrs: HTMLAttributes;
    subTree: Node | null;
    content: Atom[] | Atom;
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
        el.setAttribute(key, attrs[key]);
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

const makeGenericDOMAtomFn = (el: string) => {
    return (data: Record<string, any>): DOMAtom => {
        let content = data.content;
        if (
            typeof content["render"] !== "function" &&
            !isTypePred<Array<any>>(content, Array)
        ) {
            content = text(content);
        }
        return {
            el,
            attrs: data.attrs ? data.attrs : {},
            content,
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
    attrs: {
        "in-width": "100%",
        "in-height": "100%",
        "in-display": "flex",
        "in-justify-content": "center",
        "in-align-items": "center",
        "in-flex-direction": "column",
    },
    content: [
        div({
            attrs: { "in-margin-bottom": "1rem" },
            content: h1({ content: 0 }),
        }),
        div({
            content: [
                button({
                    attrs: { "in-padding": "1em", "in-margin-right": "1em" },
                    content: "increment",
                }),
                button({
                    attrs: { "in-padding": "1em" },
                    content: "decrement",
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
