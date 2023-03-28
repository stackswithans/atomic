import { createElectron, Electron, reactiveTransform } from "./electron";
import { Particle, Atom } from "./atom";
import { on } from "./protons";
import { div, h1, h4, button } from "./dom-particle";
import { If } from "./core-atoms";

const count = createElectron(0);
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
                ,
            ],
        }),
    ],
});

const visible = createElectron(true);

export const IfTest = div({
    "in-width": "100%",
    "in-height": "100%",
    "in-display": "flex",
    "in-background-color": "black",
    "in-color": "white",
    "in-justify-content": "center",
    "in-align-items": "center",
    "in-flex-direction": "column",
    gap: "1.2em",
    content: [
        If(
            visible,
            div({
                "in-width": "50px",
                "in-height": "50px",
                "in-background-color": "red",
            })
        ),
        button({
            "in-padding": "1em 2em",
            "in-border-radius": "20px",
            "in-background-color": "blue",
            "in-color": "white",
            content: "ToggleVis",
            on: on("click", () => visible.mutate(!visible.view())),
        }),
    ],
});
