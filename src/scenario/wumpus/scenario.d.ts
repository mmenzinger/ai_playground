export declare enum EDirection {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
}
export declare type Direction = number;
export declare enum EPercept {
    None = 0,
    Bump = 1,
    Breeze = 2,
    Stench = 4,
    Glitter = 8,
    Scream = 16,
}
export declare type Percept = number;
export declare enum ETile {
    Unknown = 7,
    Empty = 0,
    Pit = 1,
    Wumpus = 2,
    Gold = 4,
}
export declare type Tile = number;
export declare enum EAction {
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
export declare type Action = {
    type: number
    x?: number,
    y?: number,
}
export declare type Settings = {
    complexity: number,
    size: number,
    seed: string,
    //delay: number,
}
export declare type State = {
    size: number;
    complexity: number;
    seed: string;
    map: Uint8Array;
    position: { x: number, y: number };
    percepts: Percept;
    score: number;
    alive: boolean;
    arrows: number;
}
export declare type Agent = {
    init?: (state: State) => Promise<void>,
    update: (state: State, actions: Action[]) => Promise<Action>,
    result?: (oldState: State, action: Action, newState: State, score: number) => Promise<void>,
    finish?: (state: State, score: number) => Promise<void>,
}
export declare function copyState(state: State): State;
export declare function createState(settings: Settings): State;
export declare function getTile(state: State, x: number, y: number): Tile;
export declare function getPercepts(state: State, x: number, y: number): Percept;
export declare function hasWon(state: State): boolean;
export declare function getActions(state: State): Action[];
export declare function validateAction(state: State, action: Action): void;
export declare function validAction(state: State, action: Action): boolean;
export declare function performAction(state: State, action: Action): State;
export declare function run(state: State, player: Agent, update: boolean): Promise<State>;