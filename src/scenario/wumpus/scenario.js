/*******************************************************************************
 * scenario.js
 * 
 * This file contains all the scenario specific functionality. Normally you do
 * not need to edit this file, unless you want to change the core rules of the
 * scenario.
 * 
 * A description on how to use this library can be found inside the scenario.md
 * file.
 */
import * as _ from 'lib/utils.js';

//------------------------------------------------------------------------------
export const EComplexity = {
    Simple:   0 | 0,
    Advanced: 1 | 0,
    0: 'Simple',
    1: 'Advanced',
}

//------------------------------------------------------------------------------
export const EDirection = {
    Up:    0 | 0,
    Down:  1 | 0,
    Left:  2 | 0,
    Right: 3 | 0,
    0: 'Up',
    1: 'Down',
    2: 'Left',
    3: 'Right',
};

//------------------------------------------------------------------------------
export const EAction = {
    Wait:       0 | 0,
    Shoot:      4 | 0,
    ShootUp:    4 | EDirection.Up,
    ShootDown:  4 | EDirection.Down,
    ShootLeft:  4 | EDirection.Left,
    ShootRight: 4 | EDirection.Right,
    Move:       8 | 0,
    MoveUp:     8 | EDirection.Up,
    MoveDown:   8 | EDirection.Down,
    MoveLeft:   8 | EDirection.Left,
    MoveRight:  8 | EDirection.Right,
    MoveTo:     8 | 16,
     0: 'Wait',
     4: 'Shoot|ShootUp',
     5: 'ShootDown',
     6: 'ShootLeft',
     7: 'ShootRight',
     8: 'Move|MoveUp',
     9: 'MoveDown',
    10: 'MoveLeft',
    11: 'MoveRight',
    24: 'MoveTo',
};

//------------------------------------------------------------------------------
export const EPercept = {
    None:    0 | 0,
    Bump:    1 | 0,
    Breeze:  2 | 0,
    Stench:  4 | 0,
    Glitter: 8 | 0,
    Scream: 16 | 0,
     0: 'None',
     1: 'Bump',
     2: 'Breeze',
     4: 'Stench',
     8: 'Glitter',
    16: 'Scream',
     5: 'Stench,Bump',
     6: 'Stench,Breeze',
    12: 'Stench,Glitter',
    20: 'Stench,Scream',
     7: 'Stench,Breeze,Bump',
    14: 'Stench,Breeze,Glitter',
    22: 'Stench,Breeze,Scream',
     3: 'Breeze,Bump',
    10: 'Breeze,Glitter',
};

//------------------------------------------------------------------------------
export const ETile = {
    Unknown: 7 | 0,
    Empty:   0 | 0,
    Pit:     1 | 0,
    Wumpus:  2 | 0,
    Gold:    4 | 0,
    0: 'Empty',
    1: 'Pit',
    2: 'Wumpus',
    4: 'Gold',
    7: 'Unknown',
};

//------------------------------------------------------------------------------
export function getMap(state) {
    const size = state.size;
    const seed = state.seed;
    const pitchance = 0.15;
    const rng = _.seedRandom(`${seed}x${size}`);

    const map = new Uint8Array(new ArrayBuffer(state.size ** 2));

    const maxTries = 10;

    function addPercept(percept, x, y) {
        if (x >= 0 && x < size && y >= 0 && y < size) {
            map[x + y * size] |= percept;
        }
    }

    function setTile(type, percept, perceptPos, validPos) {
        let x = Math.round(rng() * (size - 1));
        let y = Math.round(rng() * (size - 1));
        for (let tries = 0; tries < maxTries; tries++) {
            if (validPos(x, y) && (map[y * size + x] >>> 5) === ETile.Empty) {
                map[y * size + x] |= type << 5;
                for (let pos of perceptPos) {
                    addPercept(percept, x + pos[0], y + pos[1]);
                }
                break;
            }
            x = Math.round(rng() * (size - 1));
            y = Math.round(rng() * (size - 1));
        }
    }

    const spot = [[0, 0]];
    const cross = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];

    setTile(ETile.Gold, EPercept.Glitter, spot, (x, y) => x >= size / 2 || y >= size / 2);
    setTile(ETile.Wumpus, EPercept.Stench, cross, (x, y) => x > 1 || y > 1);
    for (let pit = 0; pit < size ** 2 * pitchance - 1; pit++) {
        setTile(ETile.Pit, EPercept.Breeze, cross, (x, y) => {
            if (x <= 1 && y <= 1)
                return false;
            for (let row = y - 2; row <= y + 2; row++) {
                for (let col = x - 2; col <= x + 2; col++) {
                    if (row !== y && col !== x
                        && row >= 0 && row < size
                        && col >= 0 && col < size
                        && map[col + row * size] >>> 5 & ETile.Pit)
                        return false;
                }
            }
            return true;
        });
    }
    return map;
}

//------------------------------------------------------------------------------
let mapSeed = '';
let map;
function realTile(state, x, y) {
    const size = state.size;
    const seed = `${state.seed}x${size}`;
    if (seed !== mapSeed || !map) {
        mapSeed = seed;
        map = getMap(state);
    }
    return map[x + y * size];
}

//------------------------------------------------------------------------------
export function copyState(state) {
    return {
        ...state,
        map: new Uint8Array(state.map),
        position: { ...state.position },
    }
}

//------------------------------------------------------------------------------
export function createState(settings, map = new Uint8Array(new ArrayBuffer(settings.size ** 2)).fill(0xff)) {
    const state = {
        size: settings.size,
        complexity: settings.complexity,
        seed: settings.seed,
        map,
        position: { x: 0, y: 0 },
        percepts: 0,
        score: 0,
        alive: true,
        arrows: 1,
    };
    state.map[state.position.y * state.size + state.position.x] = 0;
    return state;
}

//------------------------------------------------------------------------------
export function getTile(state, x, y) {
    const tile = state.map[x + y * state.size] >>> 5;
    if (tile === ETile.Unknown)
        return ETile.Unknown;
    return tile;
}

//------------------------------------------------------------------------------
export function getPercepts(state, x, y) {
    const tile = state.map[x + y * state.size];
    if (tile >>> 5 === ETile.Unknown)
        return 0;
    return tile & 0b11111;
}

//------------------------------------------------------------------------------
export function hasWon(state) {
    return (state.percepts & EPercept.Glitter) > 0
}

//------------------------------------------------------------------------------
export function getActions(state) {
    const actions = [];
    if (state.arrows > 0)
        actions.push({ type: EAction.ShootUp }, { type: EAction.ShootDown }, { type: EAction.ShootLeft }, { type: EAction.ShootRight });
    if (state.complexity === EComplexity.Advanced)
        actions.push({ type: EAction.MoveUp }, { type: EAction.MoveDown }, { type: EAction.MoveLeft }, { type: EAction.MoveRight });
    else {
        const size = state.size;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (getTile(state, x, y) === ETile.Empty || (
                    (x > 0 && getTile(state, x - 1, y) !== ETile.Unknown) ||
                    (x < (size - 1) && getTile(state, x + 1, y) !== ETile.Unknown) ||
                    (y > 0 && getTile(state, x, y - 1) !== ETile.Unknown) ||
                    (y < (size - 1) && getTile(state, x, y + 1) !== ETile.Unknown)))
                    actions.push({ type: EAction.MoveTo, x, y });
            }
        }
    }
    return actions;
}

//------------------------------------------------------------------------------
export function validateAction(state, action) {
    if (!validAction(state, action)) {
        let error = `invalid action ${action.type}`;
        if (action.type === EAction.MoveTo) {
            error = `invalid action ${action.type} (${action.x}, ${action.y})`;
        }
        throw Error(error);
    }
}

//------------------------------------------------------------------------------
export function validAction(state, action) {
    // directional move is always valid
    if (action.type === EAction.MoveUp || action.type === EAction.MoveDown
        || action.type === EAction.MoveLeft || action.type === EAction.MoveRight)
        return true;
    // you can only shoot when there are arrows left
    if (state.arrows > 0 && action.type === EAction.ShootUp || action.type === EAction.ShootDown
        || action.type === EAction.ShootLeft || action.type === EAction.ShootRight)
        return true;
    // moveto only adjacent to or on to explored tiles
    if (action.type === EAction.MoveTo && action.x !== undefined && action.y !== undefined) {
        const x = action.x;
        const y = action.y;
        if (
            getTile(state, x, y) === ETile.Empty || 
            (x > 0 && getTile(state, x - 1, y) !== ETile.Unknown) ||
            (x < (state.size - 1) && getTile(state, x + 1, y) !== ETile.Unknown) ||
            (y > 0 && getTile(state, x, y - 1) !== ETile.Unknown) ||
            (y < (state.size - 1) && getTile(state, x, y + 1) !== ETile.Unknown)
        ) {
            return true;
        }
    }

    return false;
}

//------------------------------------------------------------------------------
export function performAction(state, action) {
    validateAction(state, action);
    const newState = copyState(state);
    const size = state.size;
    newState.percepts = EPercept.None;

    if (action.type === EAction.MoveUp) newState.position.y--;
    if (action.type === EAction.MoveDown) newState.position.y++;
    if (action.type === EAction.MoveLeft) newState.position.x--;
    if (action.type === EAction.MoveRight) newState.position.x++;
    if (action.type === EAction.MoveTo && action.x !== undefined && action.y !== undefined) { newState.position.x = action.x; newState.position.y = action.y };

    if (newState.position.x < 0) { newState.percepts |= EPercept.Bump; newState.position.x = 0; }
    if (newState.position.x >= size) { newState.percepts |= EPercept.Bump; newState.position.x = size - 1; }
    if (newState.position.y < 0) { newState.percepts |= EPercept.Bump; newState.position.y = 0; }
    if (newState.position.y >= size) { newState.percepts |= EPercept.Bump; newState.position.y = size - 1; }

    const x = newState.position.x;
    const y = newState.position.y;

    for (const [actionType, px, py] of [
        [EAction.ShootUp, x, y - 1],
        [EAction.ShootDown, x, y + 1],
        [EAction.ShootLeft, x - 1, y],
        [EAction.ShootRight, x + 1, y],
    ]) {
        if (action.type === actionType) {
            newState.arrows--;
            if (px >= 0 && py >= 0 && px < size && py < size && getTile(newState, px, py) === ETile.Unknown) {
                const tile = realTile(newState, px, py);
                if (tile >>> 5 & ETile.Wumpus) {
                    map[px + py * size] ^= (ETile.Wumpus << 5);
                    newState.percepts |= EPercept.Scream;
                }
            }
        }
    }

    newState.map[x + y * size] = realTile(newState, x, y);
    newState.percepts |= getPercepts(newState, x, y);

    if (getTile(newState, x, y) & (ETile.Pit | ETile.Wumpus)) {
        newState.alive = false;
    }

    let score = -1;
    if (!newState.alive)
        score = -1000;
    if (newState.percepts & EPercept.Glitter)
        score = 1000;

    newState.score += score;
    return newState;
}

//------------------------------------------------------------------------------
export async function run(state, player, delay = 100, updateGUI = true) {
    if (updateGUI){
        await _.loadImages([
            'project/explorer.png',
            'project/wumpus.png',
            'project/gold.png',
            'project/pit.png',
            'project/stench.png',
            'project/breeze.png',
            'project/glitter.png',
        ]);
    }

    if (player.init instanceof Function){
        await player.init(state);
    }
    if (updateGUI) {
        drawState(state);
    }

    let newState = state;
    while (!hasWon(state) && state.alive && state.score > -1000) {
        if(delay){
            await _.sleep(delay);
        }
        const actions = getActions(state);
        const action = await player.update(state, actions);
        newState = performAction(state, action);
        if (player.result instanceof Function){
            await player.result(state, action, newState, newState.score);
        }
        if (updateGUI){
            if(action.type & EAction.MoveTo){
                _.addMessage(`<p>MoveTo: ${action.x}, ${action.y}</p>`);
            }
            else {
                _.addMessage(`<p>${EAction[action.type]}</p>`);
            }
            drawState(newState);
        }
        state = newState;
    }
    if (updateGUI){
        if(state.score < 0){
            _.addMessage(`<h1>The explorer died!</h1>`);
        }
        else{
            _.addMessage(`<h1>The explorer found the gold!</h1>`);
        }
    }

    if (player.finish instanceof Function) {
        await player.finish(newState, newState.score);
    }
    return state;
}

//------------------------------------------------------------------------------
let oldPos;
export function drawState(state) {
    const canvas = _.getCanvas();
    const size = Math.min(canvas.width, canvas.height);
    const tileSize = size / state.size;
    var ctx = canvas.getContext("2d");
    ctx.lineWidth = Math.ceil(tileSize / 60);
    ctx.strokeStyle = '#aaa';
    
    if(!oldPos){
        for (let row = 0; row < state.size; row++) {
            for (let col = 0; col < state.size; col++) {
                drawTile(ctx, size, state, row, col);
            }
        }
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 0, size, size);
        ctx.restore();
        drawTile(ctx, size, state, state.position.y, state.position.x);
        oldPos = {row: state.position.y, col: state.position.x};
    }
    else{
        drawTile(ctx, size, state, oldPos.row, oldPos.col);
        const row = state.position.y;
        const col = state.position.x;
        oldPos = { row, col };
        drawTile(ctx, size, state, row, col);
    }
    drawPlayer(ctx, size, state);
}

//------------------------------------------------------------------------------
function drawTile(ctx, size, state, row, col) {
    const fullTile = realTile(state, col, row);
    let tile = fullTile >>> 5;
    let percepts = fullTile & 0x1f;
    const tileSize = size / state.size;

    ctx.clearRect(col*tileSize, row*tileSize, tileSize, tileSize);
    
    const margin = Math.floor(ctx.lineWidth / 2);
    ctx.beginPath();
    ctx.moveTo(col * tileSize + margin, row * tileSize + margin);
    ctx.lineTo((col+1) * tileSize - margin, row * tileSize + margin);
    ctx.lineTo((col+1) * tileSize - margin, (row+1) * tileSize - margin);
    ctx.lineTo(col * tileSize + margin, (row+1) * tileSize - margin);
    ctx.lineTo(col * tileSize + margin, row * tileSize + margin);
    ctx.stroke();

    switch(tile){
        case ETile.Gold: {
            const img = _.getImage('gold');
            const factor = tileSize / Math.max(img.width, img.height);
            const x = col * tileSize + tileSize/5;
            const y = row * tileSize + tileSize/6;
            ctx.drawImage(img, x, y, img.width*factor, img.height*factor);
            break;
        }
        case ETile.Wumpus: {
            const img = _.getImage('wumpus');
            const factor = tileSize / Math.max(img.width, img.height) * 0.9;
            const x = col * tileSize + tileSize/20;
            const y = row * tileSize + tileSize/10;
            ctx.drawImage(img, x, y, img.width*factor, img.height*factor);
            break;
        }
        case ETile.Pit: {
            const img = _.getImage('pit');
            const factor = tileSize / Math.max(img.width, img.height);
            const x = col * tileSize;
            const y = row * tileSize;
            ctx.drawImage(img, x, y, img.width*factor, img.height*factor);
            break;
        }
    }

    if(percepts & EPercept.Breeze){
        const img = _.getImage('breeze');
        const factor = tileSize / Math.max(img.width, img.height) * 0.25;
        const x = col * tileSize + tileSize/50;
        const y = row * tileSize + tileSize/50;
        ctx.drawImage(img, x, y, img.width*factor, img.height*factor);
    }
    if(percepts & EPercept.Stench){
        const img = _.getImage('stench');
        const factor = tileSize / Math.max(img.width, img.height) * 0.25;
        const x = col * tileSize + tileSize*0.75;
        const y = row * tileSize + tileSize/50;
        ctx.drawImage(img, x, y, img.width*factor, img.height*factor);
    }
    if(percepts & EPercept.Glitter){
        const img = _.getImage('glitter');
        const factor = tileSize / Math.max(img.width, img.height) * 0.25;
        const x = col * tileSize + tileSize*0.75;
        const y = row * tileSize + tileSize*0.75;
        ctx.drawImage(img, x, y, img.width*factor, img.height*factor);
    }
}

//------------------------------------------------------------------------------
function drawPlayer(ctx, size, state) {
    const img = _.getImage('explorer');
    const tileSize = size / state.size;
    const factor = tileSize / Math.max(img.width, img.height) * 0.8;
    const x = state.position.x * tileSize + tileSize/20;
    const y = state.position.y * tileSize + tileSize/6;
    ctx.drawImage(img, x, y, img.width*factor, img.height*factor);
}