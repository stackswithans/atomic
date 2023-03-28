import { isTypePred, isType, keyFilter } from "./utils";
import { Proton } from "./protons";
import { reactiveTransform } from "./orbit";
import { Particle } from "./atom";

type HTMLAttributes = Record<string, string | boolean>;

interface DOMParticleShape {
    content: any;
    [attrOrProton: string]: any;
}

export interface DOMParticle extends Particle {
    el: string;
    attrs: HTMLAttributes;
    node: Node | null;
    content: Particle | Particle[] | null;
    protons: Record<string, Proton>;
    mount(selector: string): void;
}

type VoidDOMParticleShape = Omit<DOMParticleShape, "content">;
type VoidDOMParticle = Omit<DOMParticle, "content">;

const text = (content: any): Particle => {
    return {
        render: (parent: HTMLElement): Node =>
            document.createTextNode(`${content}`),
    };
};

const attrFilter = (data: DOMParticleShape | VoidDOMParticleShape) =>
    keyFilter(
        data,
        (key) =>
            ((key as string) !== "content" && typeof data[key] === "string") ||
            typeof data[key] === "boolean"
    );
const isValidProtonSpec = (data: any) => {
    return (
        isType(data, "function") ||
        (data instanceof Array && data.every((val) => isType(val, "function")))
    );
};
const protonFilter = (data: DOMParticleShape | VoidDOMParticleShape) =>
    keyFilter(data, (key) => isValidProtonSpec(data[key]));

const textTransform = (content: any): Particle | Particle[] | null => {
    return typeof content["render"] !== "function" &&
        !isTypePred<Array<any>>(content, Array)
        ? text(content)
        : null;
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

const setAttrs = (el: HTMLElement, attrs: HTMLAttributes) => {
    Object.keys(attrs).forEach((key) => {
        el.setAttribute(key, attrs[key].toString());
    });
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

const DOMParticleBuilder = (el: keyof HTMLElementTagNameMap) => {
    return (data: DOMParticleShape | VoidDOMParticleShape): DOMParticle => {
        let content = data.content
            ? runContentTransforms(data.content, [
                  reactiveTransform,
                  textTransform,
              ])
            : null;
        let attrs = attrFilter(data);
        let protons = protonFilter(data);

        console.log(protons);

        return {
            el,
            attrs: attrs ? attrs : {},
            content,
            protons,
            node: null,
            render(parent: HTMLElement | null): Node {
                //If node has already been rendered
                if (this.node) return this.node;

                const elNode = document.createElement(el);
                setAttrs(elNode, this.attrs);
                this.node = elNode;
                activateProtons(elNode, this.protons);
                if (!this.content) return elNode;

                if (isTypePred<Array<Particle>>(this.content, Array)) {
                    this.content.forEach((child) => {
                        elNode.appendChild(child.render(elNode));
                    });
                } else {
                    elNode.appendChild(this.content.render(elNode));
                }
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

//Particle builders for void html elements
export const area = DOMParticleBuilder("area");
export const base = DOMParticleBuilder("base");
export const br = DOMParticleBuilder("br");
export const col = DOMParticleBuilder("col");
export const embed = DOMParticleBuilder("embed");
export const hr = DOMParticleBuilder("hr");
export const img = DOMParticleBuilder("img");
export const input = DOMParticleBuilder("input");
export const link = DOMParticleBuilder("link");
export const meta = DOMParticleBuilder("meta");
export const source = DOMParticleBuilder("source");
export const track = DOMParticleBuilder("track");
export const wbr = DOMParticleBuilder("wbr");

//Particle builders for normal html elements
export const div = DOMParticleBuilder("div");
export const h1 = DOMParticleBuilder("h1");
export const h2 = DOMParticleBuilder("h2");
export const h3 = DOMParticleBuilder("h3");
export const h4 = DOMParticleBuilder("h4");
export const h5 = DOMParticleBuilder("h5");
export const h6 = DOMParticleBuilder("h6");
export const a = DOMParticleBuilder("a");
export const abbr = DOMParticleBuilder("abbr");
export const address = DOMParticleBuilder("address");
export const article = DOMParticleBuilder("article");
export const aside = DOMParticleBuilder("aside");
export const audio = DOMParticleBuilder("audio");
export const b = DOMParticleBuilder("b");
export const bdi = DOMParticleBuilder("bdi");
export const bdo = DOMParticleBuilder("bdo");
export const blockquote = DOMParticleBuilder("blockquote");
export const body = DOMParticleBuilder("body");
export const button = DOMParticleBuilder("button");
export const canvas = DOMParticleBuilder("canvas");
export const caption = DOMParticleBuilder("caption");
export const cite = DOMParticleBuilder("cite");
export const code = DOMParticleBuilder("code");
export const colgroup = DOMParticleBuilder("colgroup");
//hack to get around ts bug
export const content = DOMParticleBuilder("content" as any);
export const data = DOMParticleBuilder("data");
export const datalist = DOMParticleBuilder("datalist");
export const dd = DOMParticleBuilder("dd");
export const del = DOMParticleBuilder("del");
export const details = DOMParticleBuilder("details");
export const dfn = DOMParticleBuilder("dfn");
export const dialog = DOMParticleBuilder("dialog");
export const dl = DOMParticleBuilder("dl");
export const dt = DOMParticleBuilder("dt");
export const em = DOMParticleBuilder("em");
export const fieldset = DOMParticleBuilder("fieldset");
export const figcaption = DOMParticleBuilder("figcaption");
export const figure = DOMParticleBuilder("figure");
export const footer = DOMParticleBuilder("footer");
export const form = DOMParticleBuilder("form");
export const head = DOMParticleBuilder("head");
export const header = DOMParticleBuilder("header");
export const hgroup = DOMParticleBuilder("hgroup");
export const html = DOMParticleBuilder("html");
export const i = DOMParticleBuilder("i");
export const iframe = DOMParticleBuilder("iframe");
export const ins = DOMParticleBuilder("ins");
export const kbd = DOMParticleBuilder("kbd");
export const label = DOMParticleBuilder("label");
export const legend = DOMParticleBuilder("legend");
export const li = DOMParticleBuilder("li");
export const main = DOMParticleBuilder("main");
export const map = DOMParticleBuilder("map");
export const mark = DOMParticleBuilder("mark");
export const menu = DOMParticleBuilder("menu");
export const meter = DOMParticleBuilder("meter");
export const nav = DOMParticleBuilder("nav");
export const noscript = DOMParticleBuilder("noscript");
export const object = DOMParticleBuilder("object");
export const ol = DOMParticleBuilder("ol");
export const optgroup = DOMParticleBuilder("optgroup");
export const option = DOMParticleBuilder("option");
export const output = DOMParticleBuilder("output");
export const p = DOMParticleBuilder("p");
export const picture = DOMParticleBuilder("picture");
export const pre = DOMParticleBuilder("pre");
export const progress = DOMParticleBuilder("progress");
export const q = DOMParticleBuilder("q");
export const rp = DOMParticleBuilder("rp");
export const rt = DOMParticleBuilder("rt");
export const ruby = DOMParticleBuilder("ruby");
export const s = DOMParticleBuilder("s");
export const samp = DOMParticleBuilder("samp");
export const script = DOMParticleBuilder("script");
export const section = DOMParticleBuilder("section");
export const select = DOMParticleBuilder("select");
export const slot = DOMParticleBuilder("slot");
export const small = DOMParticleBuilder("small");
export const span = DOMParticleBuilder("span");
export const strong = DOMParticleBuilder("strong");
export const style = DOMParticleBuilder("style");
export const sub = DOMParticleBuilder("sub");
export const summary = DOMParticleBuilder("summary");
export const sup = DOMParticleBuilder("sup");
export const table = DOMParticleBuilder("table");
export const tbody = DOMParticleBuilder("tbody");
export const td = DOMParticleBuilder("td");
export const template = DOMParticleBuilder("template");
export const textarea = DOMParticleBuilder("textarea");
export const tfoot = DOMParticleBuilder("tfoot");
export const th = DOMParticleBuilder("th");
export const thead = DOMParticleBuilder("thead");
export const time = DOMParticleBuilder("time");
export const title = DOMParticleBuilder("title");
export const tr = DOMParticleBuilder("tr");
export const u = DOMParticleBuilder("u");
export const ul = DOMParticleBuilder("ul");
export const Var = DOMParticleBuilder("var");
export const video = DOMParticleBuilder("video");
