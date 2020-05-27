export declare const Player: Readonly<{
    None: number;
    Computer: number;
    Human: number;
    Both: number;
    Player1: number;
    Player2: number;
}>;
export declare type Player = number;
export declare type Settings = {
    startingPlayer: number;
};
export declare type State = {
    board?: number[][];
    player?: number;
};
export declare type Action = {
    row: number;
    col: number;
    player: Player;
};
export declare type PlayerObject = {
    init?: (state: number) => Promise<void>;
    update: (state: number, actions: number[]) => Promise<number>;
    result?: (oldState: number, action: number, newState: number, score: number) => Promise<void>;
    finish?: (state: number, score: number) => Promise<void>;
};
export declare function getPlayer(state: number): number;
export declare function getBoard(state: number): number[][];
export declare function createAction(player: Player, row: number, col: number): number;
export declare function createState(player: Player, board?: number[][]): number;
export declare function stateToObject(state: number): State;
export declare function actionToObject(action: number): Action;
export declare function getScore(state: number, player: Player): number;
export declare function getWinner(state: number): number;
export declare function getActions(state: number): number[];
export declare function validateAction(state: number, action: number): void;
export declare function validAction(state: number, action: number): boolean;
export declare function performAction(state: number, action: number): number;
export declare function run(state: number, player1: PlayerObject, player2?: PlayerObject): Promise<number>;
export declare function __run(settings: Settings): Promise<number>;
export declare class ScenarioError extends Error {}
