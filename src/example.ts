import { useOrbit, Electron, reactiveTransform } from "./orbit";
import { Particle, Atom } from "./atom";
import { on } from "./protons";
import { div, h1, h4, button } from "./dom-particle";

const count = useOrbit(0);
let intervalId: ReturnType<typeof setInterval> | null = null;

const CounterBtn: Atom<{ text: string; onClick: Function; bgColor: string }> = (
    props: Record<string, any>
): Particle => {
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
