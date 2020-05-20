import { hideImport } from '@util';
import { call } from '@worker/types';

export const Player = Object.freeze({
    None:     0b00,
    Computer: 0b01,
    Human:    0b10,
    Both:     0b11,
    Player1:  0b01,
    Player2:  0b10,
});

export type Player = number;

export type Settings = {
    startingPlayer: number,
}

export type State = {
    board?: number[][],
    player?: number,
}

export type Action = {
    row: number,
    col: number,
    player: Player,
};

export type PlayerObject = {
    init?: (state: number) => Promise<void>,
    update: (state: number, actions: number[]) => Promise<number>,
    result?: (oldState: number, action: number, newState: number, score: number) => Promise<void>,
    finish?: (state: number, score: number) => Promise<void>,
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

export function getPlayer(state: number) : number{
    return state >>> sPlayer & bPlayer; 
}

export function getBoard(state: number): number[][]{
    const b = state & bBoard;
    return [
        [(b       ) & bPlayer, (b >>>  2) & bPlayer, (b >>>  4) & bPlayer],
        [(b >>>  6) & bPlayer, (b >>>  8) & bPlayer, (b >>> 10) & bPlayer],
        [(b >>> 12) & bPlayer, (b >>> 14) & bPlayer, (b >>> 16) & bPlayer],
    ];
}

export function createAction(player: Player, row: number, col: number): number{
    return (row & bRow) << sRow | (col & bCol) << sCol | (player & bPlayer);
}

export function createState(player: Player, board?: number[][]): number{
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

export function stateToObject(state: number): State{
    return  {
        board: getBoard(state),
        player: getPlayer(state),
    }
}

export function actionToObject(action: number): Action{
    return {
        player: (action & bPlayer),
        row: (action >>> sRow) & bRow,
        col: (action >>> sCol) & bCol,
    }
}

export function getScore(state: number, player: Player): number {
    const winner = getWinner(state);
    if (winner === player)
        return 1 | 0;
    if (winner === Player.Both || winner === Player.None)
        return 0 | 0;
    return -1 | 0;
}

export function getWinner(state: number): number {
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
            return Player.None;
    }
    
    return Player.Both;
}

export function getActions(state: number): number[] {
    const actions: number[] = [];
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

export function validateAction(state: number, action: number) {
    const player = action & bPlayer;
    const board = state & bBoard;
    const row = (action >>> sRow) & bRow;
    const col = (action >>> sCol) & bCol;

    if(!Number.isInteger(action) || (action & (~bAction))){
        throw new ScenarioError(`invalid action: ${action}\nThe update function needs to return a valid Action!`);
    }
    if (row === 3) throw new ScenarioError(`row index must be between 0 and 2 (was ${row})`);
    if (col === 3) throw new ScenarioError(`col index must be between 0 and 2 (was ${col})`);
    if (((board >>> (row * 6 + col*2)) & bPlayer) !== Player.None) throw new ScenarioError(`position (${row}, ${col}) not empty`);
    if (player !== ((state >>> sPlayer) & bPlayer)) throw new ScenarioError(`invalid player ${player}`);
}

export function validAction(state: number, action: number) {
    try {
        validateAction(state, action);
        return true;
    }
    catch (e) {
        return false;
    }
}

export function performAction(state: number, action: number) {
    validateAction(state, action);

    const row = (action >>> sRow) & bRow;
    const col = (action >>> sCol) & bCol;
    const newState = (
        ((state & bBoard) | (action & bPlayer) << (row * 6 + col*2)) | 
        (((action & bPlayer) ^ 0b11) << sPlayer)
    );

    return newState;
}

export async function run(state: number, player1: PlayerObject, player2: PlayerObject = {
    init: (state: number) => 
        call('onInit', [state]),
    update: (state: number, actions: number[]) => 
        call('onUpdate', [state, actions]),
    result: (oldState: number, action: number, state: number, score: number) => 
        call('onResult', [oldState, action, state, score]),
    finish: (state: number, score: number) => 
        call('onFinish', [state, score]),
}) {
    const players = [player1, player2];
    if (player1.init instanceof Function)
        await player1.init(state);
    if (player2.init instanceof Function)
        await player2.init(state);

    let winner = Player.None;
    while (winner === Player.None) {
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
        const score1 = getScore(state, Player.Player1);
        await player1.finish(state, score1);
    }
    if (player2.finish instanceof Function) {
        const score2 = getScore(state, Player.Player2);
        await player2.finish(state, score2);
    }
    return state;
}

export async function __run(settings: Settings) {
    const state = createState(settings.startingPlayer);

    const player1 = await hideImport('/project/index.js') as PlayerObject;
    return await run(state, player1);
}

export class ScenarioError extends Error{}; 