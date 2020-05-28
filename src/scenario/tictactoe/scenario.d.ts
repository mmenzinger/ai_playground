export declare class ScenarioError extends Error {}
export declare enum EPlayer {
    None =     0 | 0,
    Computer = 1 | 0,
    Human =    2 | 0,
    Both =     Computer | Human,
    Player1 =  Computer,
    Player2 =  Human,
}
export declare type Player = number;
export declare type State = number;
export declare type Action = number;
export declare type Agent = {
    init?: (state: State) => Promise<void>,
    update: (state: State, actions: Action[]) => Promise<State>,
    result?: (oldState: State, action: Action, newState: State, score: number) => Promise<void>,
    finish?: (state: State, score: number) => Promise<void>,
}
export declare type Settings = {
    startingPlayer: number,
}
export declare function getPlayer(state: State) : Player;
export declare function getBoard(state: State): Player[][];
export declare function createAction(player: Player, row: number, col: number): Action;
export declare function createState(player: Player, board?: Player[][]): State;
export declare function stateToObject(state: State): {board: Player[][], player: Player};
export declare function actionToObject(action: Action): {player: Player, row: number, col: number};
export declare function getScore(state: State, player: Player): number;
export declare function getWinner(state: State): Player;
export declare function getActions(state: State): Action[];
export declare function validateAction(state: State, action: Action): void;
export declare function validAction(state: State, action: Action): boolean;
export declare function performAction(state: State, action: Action): State;
export declare function run(state: State, player1: Agent, player2: Agent): Promise<State>;
