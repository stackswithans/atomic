import { Particle } from "./atom";
import { Electron } from "./orbit";

export type Proton = {
    (el: HTMLElement): void;
};

export const on = (event: string, handler: (data: any) => void): Proton => {
    return (el: HTMLElement) => {
        console.log("listener added");
        el.addEventListener(event, handler);
    };
};

export const If = (
    cond: any,
    then: Particle,
    elseP: Particle | null = null
): Proton => {
    return (el: HTMLElement) => {};
};
