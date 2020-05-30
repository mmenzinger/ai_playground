export enum EDirection {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
}
export enum EAction {
    Wait = 0,
    Shoot = 4,
    ShootUp = 4 | EDirection.Up,
    ShootDown = 4 | EDirection.Down,
    ShootLeft = 4 | EDirection.Left,
    ShootRight = 4 | EDirection.Right,
    Move = 8,
    MoveUp = 8 | EDirection.Up,
    MoveDown = 8 | EDirection.Down,
    MoveLeft = 8 | EDirection.Left,
    MoveRight = 8 | EDirection.Right,
    MoveTo = 8 | 16,
}
export enum EPercept {
    None = 0,
    Bump = 1,
    Breeze = 2,
    Stench = 4,
    Glitter = 8,
    Scream = 16,
}
export enum ETile {
    Unknown = 7,
    Empty = 0,
    Pit = 1,
    Wumpus = 2,
    Gold = 4,
}
export declare type Action = {
    type: number
    x?: number,
    y?: number,
}
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