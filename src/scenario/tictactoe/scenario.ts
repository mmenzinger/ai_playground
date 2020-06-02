import { hideImport } from '@util';
import { call } from '@worker/types';
import { ScenarioError } from '@scenario/types';

export { ScenarioError } from '@scenario/types';

export type Player = number;

export enum EPlayer {
    None =     0 | 0,
    Computer = 1 | 0,
    Human =    2 | 0,
    Both =     3 | 0,
    Player1 =  1 | 0,
    Player2 =  2 | 0,
}

export type Settings = {
    startingPlayer: number,
}

export type State = number;

export type Action = number;

export type Agent = {
    init?: (state: State) => Promise<void>,
    update: (state: State, actions: Action[]) => Promise<State>,
    result?: (oldState: State, action: Action, newState: State, score: number) => Promise<void>,
    finish?: (state: State, score: number) => Promise<void>,
}

const bState  = 0b11111111111111111111; // 2:player 18:board
const bPlayer = 0b11;
const bBoard  = 0b111111111111111111; // 2:row wise, left to right
const sPlayer = 18;

const bAction = 0b111111; // 2:row 2:col 2:player
const bRow = 0b11;
const bCol = 0b11;
const sRow = 4;
const sCol = 2;

export function getPlayer(state: State) : Player{
    return state >>> sPlayer & bPlayer; 
}

export function getBoard(state: State): Player[][]{
    const b = state & bBoard;
    return [
        [(b       ) & bPlayer, (b >>>  2) & bPlayer, (b >>>  4) & bPlayer],
        [(b >>>  6) & bPlayer, (b >>>  8) & bPlayer, (b >>> 10) & bPlayer],
        [(b >>> 12) & bPlayer, (b >>> 14) & bPlayer, (b >>> 16) & bPlayer],
    ];
}

export function createAction(player: Player, row: number, col: number): Action{
    return (row & bRow) << sRow | (col & bCol) << sCol | (player & bPlayer);
}

export function createState(player: Player, board?: Player[][]): State{
    let state = (player & bPlayer) << sPlayer;
    if(board){
        state |= 
        (board[0][0] << 16 |
        board[0][1] << 14 |
        board[0][2] << 12 |
        board[1][0] << 10 |
        board[1][1] <<  8 |
        board[1][2] <<  6 |
        board[2][0] <<  4 |
        board[2][1] <<  2 |
        board[2][2] <<  0)
        & bBoard;
    }
    
    return state;
}

export function stateToObject(state: State): {board: Player[][], player: Player}{
    return  {
        board: getBoard(state),
        player: getPlayer(state),
    }
}

export function actionToObject(action: Action): {player: Player, row: number, col: number}{
    return {
        player: (action & bPlayer),
        row: (action >>> sRow) & bRow,
        col: (action >>> sCol) & bCol,
    }
}

export function getScore(state: State, player: Player): number {
    const winner = getWinner(state);
    if (winner === player)
        return 1 | 0;
    if (winner === EPlayer.Both || winner === EPlayer.None)
        return 0 | 0;
    return -1 | 0;
}

export function getWinner(state: State): Player {
    const b = state & bBoard;

    // check rows
    if(((b >>> 16) & (b >>> 14) & (b >>> 12) & bPlayer) !== 0) return (b >>> 12) & bPlayer;
    if(((b >>> 10) & (b >>>  8) & (b >>>  6) & bPlayer) !== 0) return (b >>>  6) & bPlayer;
    if(((b >>>  4) & (b >>>  2) & (b       ) & bPlayer) !== 0) return  b         & bPlayer;

    // check cols
    if(((b >>> 16) & (b >>> 10) & (b >>>  4) & bPlayer) !== 0) return (b >>> 4) & bPlayer;
    if(((b >>> 14) & (b >>>  8) & (b >>>  2) & bPlayer) !== 0) return (b >>> 2) & bPlayer;
    if(((b >>> 12) & (b >>>  6) & (b       ) & bPlayer) !== 0) return  b        & bPlayer;

    // check diagonals
    if(((b >>> 16) & (b >>>  8) & (b      ) & bPlayer) !== 0) return (b      ) & bPlayer;
    if(((b >>> 12) & (b >>>  8) & (b >>> 4) & bPlayer) !== 0) return (b >>> 4) & bPlayer;

    // check draw
    for(let i = 0; i < 18; i+=2){
        if(((b >>> i) & bPlayer) === 0)
            return EPlayer.None;
    }
    
    return EPlayer.Both;
}

export function getActions(state: State): Action[] {
    const actions: Action[] = [];
    const b = state & bBoard;
    for(let i = 0; i < 9; i++){
        if(((b >>> (i*2)) & bPlayer) === 0){
            actions.push(
                ((i/3|0) << sRow |
                (i % 3) << sCol) |
                (state >>> sPlayer) & bPlayer
            );
        }
    }
    return actions;
}

export function validateAction(state: State, action: Action): void {
    const player = action & bPlayer;
    const board = state & bBoard;
    const row = (action >>> sRow) & bRow;
    const col = (action >>> sCol) & bCol;

    if(!Number.isInteger(action) || (action & (~bAction))){
        throw new ScenarioError(`invalid action: ${action}\nThe update function needs to return a valid Action!`);
    }
    if (row === 3) throw new ScenarioError(`row index must be between 0 and 2 (was ${row})`);
    if (col === 3) throw new ScenarioError(`col index must be between 0 and 2 (was ${col})`);
    if (((board >>> (row * 6 + col*2)) & bPlayer) !== EPlayer.None) throw new ScenarioError(`position (${row}, ${col}) not empty`);
    if (player !== ((state >>> sPlayer) & bPlayer)) throw new ScenarioError(`invalid player ${player}`);
}

export function validAction(state: State, action: Action): boolean{
    try {
        validateAction(state, action);
        return true;
    }
    catch (e) {
        return false;
    }
}

export function performAction(state: State, action: Action): State {
    validateAction(state, action);

    const row = (action >>> sRow) & bRow;
    const col = (action >>> sCol) & bCol;
    const newState = (
        ((state & bBoard) | (action & bPlayer) << (row * 6 + col*2)) | 
        (((action & bPlayer) ^ 0b11) << sPlayer)
    );

    return newState;
}

export async function run(state: State, player1: Agent, player2: Agent = {
    init: (state: number) => 
        call('onInit', [state]),
    update: (state: number, actions: number[]) => 
        call('onUpdate', [state, actions]),
    result: (oldState: number, action: number, state: number, score: number) => 
        call('onResult', [oldState, action, state, score]),
    finish: (state: number, score: number) => 
        call('onFinish', [state, score]),
}): Promise<State> {
    const players = [player1, player2];
    if (player1.init instanceof Function)
        await player1.init(state);
    if (player2.init instanceof Function)
        await player2.init(state);

    let winner = EPlayer.None;
    while (winner === EPlayer.None) {
        const currentPlayer = players[getPlayer(state) - 1];
        const oldState = state;
        const actions = getActions(oldState);
        const action = await currentPlayer.update(oldState, actions);
        state = performAction(oldState, action);
        winner = getWinner(state);
        if (currentPlayer.result instanceof Function){
            await currentPlayer.result(oldState, action, state, getScore(state, getPlayer(state)));
        }
    }

    state = (state & bBoard) | (winner << sPlayer);
    if (player1.finish instanceof Function) {
        const score1 = getScore(state, EPlayer.Player1);
        await player1.finish(state, score1);
    }
    if (player2.finish instanceof Function) {
        const score2 = getScore(state, EPlayer.Player2);
        await player2.finish(state, score2);
    }
    return state;
}

export async function __run(settings: Settings) {
    const state = createState(settings.startingPlayer);
    const player1 = await hideImport('/project/index.js') as Agent;
    return await run(state, player1);
}

