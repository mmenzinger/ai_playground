export type State = {
    map: Uint8Array;
    size: number;
    complexity: number;
    position: { x: number, y: number };
    percepts: number;
    score: number;
    alive: boolean;
    arrows: number;
}

export declare const Action: Readonly<{
    Wait: 0,
    MoveUp: 1,
    MoveDown: 2,
    MoveLeft: 4,
    MoveRight: 8,
    ShootUp: 16,
    ShootDown: 32,
    ShootLeft: 64,
    ShootRight: 128,
    MoveTo: 256,
}>;

export declare type Action = {
    type: number
    x?: number,
    y?: number,
};

export declare const Percept: Readonly<{
    None: 0,
    Bump: 1,
    Breeze: 2,
    Stench: 4,
    Glitter: 8,
    Scream: 16,
}>;