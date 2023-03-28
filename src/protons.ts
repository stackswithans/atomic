export type Proton = {
    (el: HTMLElement): void;
};

export const on = (event: string, handler: (data: any) => void): Proton => {
    return (el: HTMLElement) => {
        console.log("listener added");
        el.addEventListener(event, handler);
    };
};
