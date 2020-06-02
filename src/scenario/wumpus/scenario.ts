import SeedRandom from 'seedrandom';
import { hideImport } from '@util';
import { call } from '@worker/types';



export enum EDirection {
    Up = 0 | 0,
    Down = 1 | 0,
    Left = 2 | 0,
    Right = 3 | 0,
};

export enum EAction {
    Wait = 0 | 0,
    Shoot = 4 | 0,
    ShootUp = 4 | EDirection.Up,
    ShootDown = 4 | EDirection.Down,
    ShootLeft = 4 | EDirection.Left,
    ShootRight = 4 | EDirection.Right,
    Move = 8 | 0,
    MoveUp = 8 | EDirection.Up,
    MoveDown = 8 | EDirection.Down,
    MoveLeft = 8 | EDirection.Left,
    MoveRight = 8 | EDirection.Right,
    MoveTo = 8 | 16,
};

export enum EPercept {
    None = 0 | 0,
    Bump = 1 | 0,
    Breeze = 2 | 0,
    Stench = 4 | 0,
    Glitter = 8 | 0,
    Scream = 16 | 0,
};
// @ts-ignore
EPercept[EPercept.Stench | EPercept.Scream] = 'Stench,Scream';
// @ts-ignore
EPercept[EPercept.Stench | EPercept.Breeze] = 'Stench,Breeze';
// @ts-ignore
EPercept[EPercept.Stench | EPercept.Breeze | EPercept.Scream] = 'Stench,Breeze,Scream';
// @ts-ignore
EPercept[EPercept.Stench | EPercept.Glitter] = 'Stench,Glitter';
// @ts-ignore
EPercept[EPercept.Stench | EPercept.Breeze | EPercept.Glitter] = 'Stench,Breeze,Glitter';
// @ts-ignore
EPercept[EPercept.Breeze | EPercept.Glitter] = 'Breeze,Glitter';
// @ts-ignore
EPercept[EPercept.Stench | EPercept.Bump] = 'Stench,Bump';
// @ts-ignore
EPercept[EPercept.Stench | EPercept.Breeze | EPercept.Bump] = 'Stench,Breeze,Bump';
// @ts-ignore
EPercept[EPercept.Breeze | EPercept.Bump] = 'Breeze,Bump';

export enum ETile {
    Unknown = 7 | 0,
    Empty = 0 | 0,
    Pit = 1 | 0,
    Wumpus = 2 | 0,
    Gold = 4 | 0,
};

export type Action = {
    type: number
    x?: number,
    y?: number,
};

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

export type Agent = {
    init?: (state: State) => Promise<void>,
    update: (state: State, actions: Action[]) => Promise<Action>,
    result?: (oldState: State, action: Action, newState: State, score: number) => Promise<void>,
    finish?: (state: State, score: number) => Promise<void>,
}



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
            if (validPos(x, y) && (map[y*size + x] >>> 5) === ETile.Empty) {
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

    setTile(ETile.Gold, EPercept.Glitter, spot, (x, y) => x >= size / 2 || y >= size / 2);
    setTile(ETile.Wumpus, EPercept.Stench, cross, (x, y) => x > 1 || y > 1);
    for (let pit = 0; pit < size ** 2 * pitchance - 1; pit++) {
        setTile(ETile.Pit, EPercept.Breeze, cross, (x, y) => {
            if(x <= 1 && y <= 1)
                return false;
            for(let row = y-2; row <= y+2; row++){
                for(let col = x-2; col <= x+2; col++){
                    if(row !== y && col !== x
                        && row >= 0 && row < size
                        && col >= 0 && col < size
                        && map[col + row*size] >>> 5 & ETile.Pit)
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
    if (tile === ETile.Unknown)
        return ETile.Unknown;
    return tile;
}

export function getPercepts(state: State, x: number, y: number) {
    const tile = state.map[x + y*state.size];
    if (tile >>> 5 === ETile.Unknown)
        return 0;
    return tile & 0b11111;
}


export function hasWon(state: State): boolean {
    return (state.percepts & EPercept.Glitter) > 0
}

export function getActions(state: State): Action[] {
    const actions = [];
    if (state.arrows > 0)
        actions.push({ type: EAction.ShootUp }, { type: EAction.ShootDown }, { type: EAction.ShootLeft }, { type: EAction.ShootRight });
    if (state.complexity === 2)
        actions.push({ type: EAction.MoveUp }, { type: EAction.MoveDown }, { type: EAction.MoveLeft }, { type: EAction.MoveRight });
    else {
        const size = state.size;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (getTile(state, x, y) === ETile.Unknown && (
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

export function validateAction(state: State, action: Action) {
    if (!validAction(state, action)) {
        let error = `invalid action ${action.type}`;
        if(action.type === EAction.MoveTo){
            error = `invalid action ${action.type} (${action.x}, ${action.y})`;
        }
        throw Error(error);
    }
}

export function validAction(state: State, action: Action) {
    // directional move is always valid
    if (action.type === EAction.MoveUp || action.type === EAction.MoveDown
        || action.type === EAction.MoveLeft || action.type === EAction.MoveRight)
        return true;
    // you can only shoot when there are arrows left
    if (state.arrows > 0 && action.type === EAction.ShootUp || action.type === EAction.ShootDown
        || action.type === EAction.ShootLeft || action.type === EAction.ShootRight)
        return true;
    // moveto only adjacent to explored tiles
    if (action.type === EAction.MoveTo && action.x !== undefined && action.y !== undefined) {
        const x = action.x;
        const y = action.y;
        if (
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

export function performAction(state: State, action: Action): State {
    validateAction(state, action);
    const newState: State = copyState(state);
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
                    map[px + py*size] ^= (ETile.Wumpus << 5);
                    newState.percepts |= EPercept.Scream;
                }
            }
        }
    }

    newState.map[x + y*size] = realTile(newState, x, y);
    newState.percepts |= getPercepts(newState, x, y);

    if (getTile(newState, x, y) & (ETile.Pit | ETile.Wumpus)){
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

export async function run(state: State, player: Agent, update = true): Promise<State> {
    if (player.init instanceof Function)
        await player.init(state);
    if (update)
        await updateGUI(state);

    let newState = state;
    while (!hasWon(state) && state.alive && state.score > -1000) {
        const actions = getActions(state);
        const action = await player.update(state, actions);
        newState = performAction(state, action);
        if (player.result instanceof Function)
            await player.result(state, action, newState, newState.score);
        if (update)
            await updateGUI(newState);
        state = newState;
    }

    if (player.finish instanceof Function) {
        await player.finish(newState, newState.score);
    }
    return state;
}

export async function __run(settings: Settings) {
    const state = createState(settings);
    await call('resetWorld', []);
    const player = await hideImport('/project/index.js');
    await run(state, player);
}