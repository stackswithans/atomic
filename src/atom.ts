export interface Particle {
    render(parent: HTMLElement | null): Node;
}

export type Atom = () => Particle;
