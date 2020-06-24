import { getCanvas } from 'lib/utils.js';

export class ScenarioError extends Error {}

export const EPlayer = {
    None:     0 | 0,
    Computer: 1 | 0,
    Human:    2 | 0,
    Both:     3 | 0,
    Player1:  1 | 0,
    Player2:  2 | 0,
    0: 'None',
    1: 'Player1',
    2: 'Player2',
    3: 'Both'
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

export function getPlayer(state){
    return state >>> sPlayer & bPlayer; 
}

export function getBoard(state){
    const b = state & bBoard;
    return [
        [(b       ) & bPlayer, (b >>>  2) & bPlayer, (b >>>  4) & bPlayer],
        [(b >>>  6) & bPlayer, (b >>>  8) & bPlayer, (b >>> 10) & bPlayer],
        [(b >>> 12) & bPlayer, (b >>> 14) & bPlayer, (b >>> 16) & bPlayer],
    ];
}

export function createAction(player, row, col){
    return (row & bRow) << sRow | (col & bCol) << sCol | (player & bPlayer);
}

export function createState(settings, board){
    let state = (settings.startingPlayer & bPlayer) << sPlayer;
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

export function stateToObject(state){
    return  {
        board: getBoard(state),
        player: getPlayer(state),
    }
}

export function actionToObject(action){
    return {
        player: (action & bPlayer),
        row: (action >>> sRow) & bRow,
        col: (action >>> sCol) & bCol,
    }
}

export function getScore(state, player) {
    const winner = getWinner(state);
    if (winner === player)
        return 1 | 0;
    if (winner === EPlayer.Both || winner === EPlayer.None)
        return 0 | 0;
    return -1 | 0;
}

export function getWinner(state) {
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

export function getActions(state) {
    const actions = [];
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

export function validateAction(state, action) {
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

export function validAction(state, action){
    try {
        validateAction(state, action);
        return true;
    }
    catch (e) {
        return false;
    }
}

export function performAction(state, action) {
    validateAction(state, action);

    const row = (action >>> sRow) & bRow;
    const col = (action >>> sCol) & bCol;
    const newState = (
        ((state & bBoard) | (action & bPlayer) << (row * 6 + col*2)) | 
        (((action & bPlayer) ^ 0b11) << sPlayer)
    );

    return newState;
}

export async function run(state, player1, player2 = {
    update: getUserUpdate
}, updateGUI = true) {
    if(updateGUI){
        drawState(state);
    }
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
        if(updateGUI){
            drawState(state);
        }
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

export function drawState(state, hover = undefined){
    const canvas = getCanvas();
    const size = Math.min(canvas.width, canvas.height);
    var ctx = canvas.getContext("2d");
    ctx.shadowOffsetX = size / 90;
    ctx.shadowOffsetY = size / 90;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 5;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, size);
    for(let row = 0; row < 3; row++){
        for(let col = 0; col < 3; col++){
            const player = (state >>> ((row*3 + col)*2)) & 0b11;
            if(player === EPlayer.Human){
                drawX(ctx, size/3, row, col);
            }
            else if(player === EPlayer.Computer){
                drawO(ctx, size/3, row, col);
            }
            else if(hover && hover.row === row && hover.col === col && player === 0){
                drawX(ctx, size/3, row, col, 'rgba(0, 0, 255, 0.5)');
            }
        }
    }
}

function drawGrid(ctx, size){
    const margin = size / 30;
    ctx.save();
    ctx.lineWidth = size / 40;
    ctx.strokeStyle = '#aaa';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(size/3, margin);
    ctx.lineTo(size/3, size - margin);
    ctx.moveTo(2*size/3, margin);
    ctx.lineTo(2*size/3, size - margin);
    ctx.moveTo(margin, size/3);
    ctx.lineTo(size - margin, size/3);
    ctx.moveTo(margin, 2*size/3);
    ctx.lineTo(size - margin, 2*size/3);
    ctx.stroke();
    ctx.restore();
}

function drawX(ctx, size, row, col, style = '#00f'){
    const margin = size / 7;
    ctx.save();
    ctx.lineWidth = size / 10;
    ctx.strokeStyle = style;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(col*size + margin*2, row*size + margin);
    ctx.lineTo(col*size + size - margin*2, row*size + size - margin);
    ctx.moveTo(col*size + size - margin*2, row*size + margin);
    ctx.lineTo(col*size + margin*2, row*size + size - margin);
    ctx.stroke();
    ctx.restore();
}

function drawO(ctx, size, row, col, style = '#f00'){
    const margin = size / 7;
    ctx.save();
    ctx.lineWidth = size / 10;
    ctx.strokeStyle = style;
    ctx.lineCap = 'round';
    ctx.save();
    ctx.scale(0.75, 1);
    ctx.beginPath();
    ctx.arc((col*size + size/2) / 0.75, row*size + size/2, (size/2) - margin, 0, Math.PI*2, false);
    ctx.restore();
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
}

async function getUserUpdate(state, actions){
    return new Promise((resolve, reject) => {
        self.onmousemove = (data) => {
            const size = Math.min(data.width, data.height);
            const row = Math.floor(data.y * 3 / size);
            const col = Math.floor(data.x * 3 / size);
            drawState(state, {row, col});
        }

        self.onmousedown = (data) => {
            const size = Math.min(data.width, data.height);
            const row = Math.floor(data.y * 3 / size);
            const col = Math.floor(data.x * 3 / size);
            const player = (state >>> ((row*3 + col)*2)) & 0b11;
            if(player === EPlayer.None){
                self.onmousemove = undefined;
                self.onmousedown = undefined;
                const action = createAction(EPlayer.Human, row, col);
                resolve(action);
            }
        }
    });
}