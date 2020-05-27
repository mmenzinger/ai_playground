import SeedRandom from 'seedrandom';
import { hideImport } from '@util';
import { call } from '@worker/types';

export type PlayerObject = {
    init?: (state: State) => Promise<void>,
    update: (state: State, actions: Action[]) => Promise<Action>,
    result?: (oldState: State, action: Action, newState: State, score: number) => Promise<void>,
    finish?: (state: State, score: number) => Promise<void>,
}

export type Settings = {
    complexity: number,
    size: number,
    seed: string,
    delay: number,
}

export type State = {
    size: number;
    complexity: number;
    seed: string;
    map: Uint8Array;
    position: { x: number, y: number };
    percepts: number;
    score: number;
    alive: boolean;
    arrows: number;
}

export const Action = Object.freeze({
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
});

export type Action = {
    type: number
    x?: number,
    y?: number,
};

export const Percept = Object.freeze({
    None: 0,
    Bump: 1,
    Breeze: 2,
    Stench: 4,
    Glitter: 8,
    Scream: 16,
});

export const Tile = Object.freeze({
    Unknown: 7,
    Empty: 0,
    Pit: 1,
    Wumpus: 2,
    Gold: 4,
});

function updateGUI(state: State) {
    return call('updateGUI', [state]);
}

export function getMap(state: State): Uint8Array {
    const size = state.size;
    const seed = state.seed;
    const pitchance = 0.15;
    const rng = SeedRandom(`${seed}x${size}`);

    const map = new Uint8Array(new ArrayBuffer(state.size ** 2));

    const maxTries = 10;

    function addPercept(percept: number, x: number, y: number) {
        if (x >= 0 && x < size && y >= 0 && y < size) {
            map[x + y*size] |= percept;
        }
    }

    function setTile(type: number, percept: number, perceptPos: number[][], validPos: (x: number, y:number) => boolean) {
        let x = Math.round(rng() * (size - 1));
        let y = Math.round(rng() * (size - 1));
        for (let tries = 0; tries < maxTries; tries++) {
            if (validPos(x, y) && (map[y*size + x] >>> 5) === Tile.Empty) {
                map[y*size + x] |= type<<5;
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
    const cross = [[0,0], [-1, 0], [1, 0], [0, -1], [0, 1]];

    setTile(Tile.Gold, Percept.Glitter, spot, (x, y) => x >= size / 2 || y >= size / 2);
    setTile(Tile.Wumpus, Percept.Stench, cross, (x, y) => x > 1 || y > 1);
    for (let pit = 0; pit < size ** 2 * pitchance - 1; pit++) {
        setTile(Tile.Pit, Percept.Breeze, cross, (x, y) => {
            if(x <= 1 && y <= 1)
                return false;
            for(let row = y-2; row <= y+2; row++){
                for(let col = x-2; col <= x+2; col++){
                    if(row !== y && col !== x
                        && row >= 0 && row < size
                        && col >= 0 && col < size
                        && map[col + row*size] >>> 5 & Tile.Pit)
                        return false;
                }
            }
            return true;
        });
    }

    return map;
}

let mapSeed = '';
let map: Uint8Array;
export function realTile(state: State, x: number, y: number) {
    const size = state.size;
    const seed = `${state.seed}x${size}`;
    if(seed !== mapSeed || !map){
        mapSeed = seed;
        map = getMap(state);
    }
    return map[x + y*size];
}

export function copyState(state: State){
    return {
        ...state,
        map: new Uint8Array(state.map),
        position: {...state.position},
    }
}

export function createState(settings: Settings, map = new Uint8Array(new ArrayBuffer(settings.size ** 2)).fill(0xff)) {
    const state: State = {
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

export function getTile(state: State, x: number, y: number) {
    const tile = state.map[x + y*state.size] >>> 5;
    if (tile === Tile.Unknown)
        return Tile.Unknown;
    return tile;
}

export function getPercepts(state: State, x: number, y: number) {
    const tile = state.map[x + y*state.size];
    if (tile >>> 5 === Tile.Unknown)
        return 0;
    return tile & 0b11111;
}


export function hasWon(state: State): boolean {
    return (state.percepts & Percept.Glitter) > 0
}

export function getActions(state: State): Action[] {
    const actions = [];
    if (state.arrows > 0)
        actions.push({ type: Action.ShootUp }, { type: Action.ShootDown }, { type: Action.ShootLeft }, { type: Action.ShootRight });
    if (state.complexity === 2)
        actions.push({ type: Action.MoveUp }, { type: Action.MoveDown }, { type: Action.MoveLeft }, { type: Action.MoveRight });
    else {
        const size = state.size;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (getTile(state, x, y) === Tile.Unknown && (
                    (x > 0 && getTile(state, x - 1, y) !== Tile.Unknown) ||
                    (x < (size - 1) && getTile(state, x + 1, y) !== Tile.Unknown) ||
                    (y > 0 && getTile(state, x, y - 1) !== Tile.Unknown) ||
                    (y < (size - 1) && getTile(state, x, y + 1) !== Tile.Unknown)))
                    actions.push({ type: Action.MoveTo, x, y });
            }
        }
    }
    return actions;
}

export function validateAction(state: State, action: Action) {
    if (!validAction(state, action)) {
        let error = `invalid action ${action.type}`;
        if(action.type === Action.MoveTo){
            error = `invalid action ${action.type} (${action.x}, ${action.y})`;
        }
        throw Error(error);
    }
}

export function validAction(state: State, action: Action) {
    // directional move is always valid
    if (action.type === Action.MoveUp || action.type === Action.MoveDown
        || action.type === Action.MoveLeft || action.type === Action.MoveRight)
        return true;
    // you can only shoot when there are arrows left
    if (state.arrows > 0 && action.type === Action.ShootUp || action.type === Action.ShootDown
        || action.type === Action.ShootLeft || action.type === Action.ShootRight)
        return true;
    // moveto only adjacent to explored tiles
    if (action.type === Action.MoveTo && action.x !== undefined && action.y !== undefined) {
        const x = action.x;
        const y = action.y;
        if (
            (x > 0 && getTile(state, x - 1, y) !== Tile.Unknown) ||
            (x < (state.size - 1) && getTile(state, x + 1, y) !== Tile.Unknown) ||
            (y > 0 && getTile(state, x, y - 1) !== Tile.Unknown) ||
            (y < (state.size - 1) && getTile(state, x, y + 1) !== Tile.Unknown)
        ) {
            return true;
        }
    }

    return false;
}

export function performAction(state: State, action: Action): State {
    validateAction(state, action);
    const newState: State = copyState(state);
    const size = state.size;
    newState.percepts = Percept.None;

    if (action.type === Action.MoveUp) newState.position.y--;
    if (action.type === Action.MoveDown) newState.position.y++;
    if (action.type === Action.MoveLeft) newState.position.x--;
    if (action.type === Action.MoveRight) newState.position.x++;
    if (action.type === Action.MoveTo && action.x !== undefined && action.y !== undefined) { newState.position.x = action.x; newState.position.y = action.y };

    if (newState.position.x < 0) { newState.percepts |= Percept.Bump; newState.position.x = 0; }
    if (newState.position.x >= size) { newState.percepts |= Percept.Bump; newState.position.x = size - 1; }
    if (newState.position.y < 0) { newState.percepts |= Percept.Bump; newState.position.y = 0; }
    if (newState.position.y >= size) { newState.percepts |= Percept.Bump; newState.position.y = size - 1; }

    const x = newState.position.x;
    const y = newState.position.y;

    for (const [actionType, px, py] of [
        [Action.ShootUp, x, y - 1],
        [Action.ShootDown, x, y + 1],
        [Action.ShootLeft, x - 1, y],
        [Action.ShootRight, x + 1, y],
    ]) {
        if (action.type === actionType) {
            newState.arrows--;
            if (px > 0 && py > 0 && px < size-1 && py < size-1 && getTile(newState, px, py) === Tile.Unknown) {
                const tile = realTile(newState, px, py);
                if (tile >>> 5 & Tile.Wumpus) {
                    map[px + py*size] ^= (Tile.Wumpus << 5);
                    newState.percepts |= Percept.Scream;
                }
            }
        }
    }

    newState.map[x + y*size] = realTile(newState, x, y);
    newState.percepts |= getPercepts(newState, x, y);

    if (getTile(newState, x, y) & (Tile.Pit | Tile.Wumpus)){
        newState.alive = false;
    }

    let score = -1;
    if (!newState.alive)
        score = -1000;
    if (newState.percepts & Percept.Glitter)
        score = 1000;

    newState.score += score;
    return newState;
}

export async function run(state: State, player: PlayerObject, update = true) {
    if (player.init instanceof Function)
        await player.init(state);
    if (update)
        await updateGUI(state);

    let newState = state;
    while (!hasWon(state) && state.alive && state.score > -1000) {
        const actions = getActions(state);
        const action = await player.update(state, actions);
        newState = performAction(state, action);

        /*let event = action.type;
        if (event === Action.MoveTo)
            event += ` ${action.x},${action.y}`;
        const events = [event];
        events.push(`Percepts: [${[...state.percepts].join(',')}]`);
        if (state.alive === false)
            events.push('You died!');
        if (this.hasWon())
            events.push('You found the gold!');*/
        if (player.result instanceof Function)
            await player.result(state, action, newState, newState.score);
        if (update)
            await updateGUI(newState);
        state = newState;
    }

    if (player.finish instanceof Function) {
        await player.finish(newState, newState.score);
    }
}

export async function __run(settings: Settings) {
    const state = createState(settings);
    await call('resetWorld', []);
    const player = await hideImport('/project/index.js');
    await run(state, player);
}