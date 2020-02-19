import SeedRandom from 'seedrandom';
import { deepCopy } from 'src/util.js';

class Random {
    constructor(seed) {
        this._rng = new SeedRandom(seed);
    }

    // Returns number between 0 (inclusive) and 1.0 (exclusive),
    random() {
        return this._rng();
    }
}

function updateGUI(state, map, events) {
    return new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = _ => {
            resolve();
        }
        postMessage({ type: 'call', functionName: 'updateGUI', args: [state, map, events] }, [channel.port2]);
    });
}


export const Percept = Object.freeze({
    Bump: 'Bump',
    Breeze: 'Breeze',
    Stench: 'Stench',
    Glitter: 'Glitter',
    Scream: 'Scream',
});

export const Action = Object.freeze({
    Wait: 'Wait',
    MoveUp: 'MoveUp',
    MoveDown: 'MoveDown',
    MoveLeft: 'MoveLeft',
    MoveRight: 'MoveRight',
    ShootUp: 'ShootUp',
    ShootDown: 'ShootDown',
    ShootLeft: 'ShootLeft',
    ShootRight: 'ShootRight',
    MoveTo: 'MoveTo',
});

export const Tile = Object.freeze({
    Empty: 'Empty',
    Pit: 'Pit',
    Wumpus: 'Wumpus',
    Gold: 'Gold',
});

export function getInitialState(settings) {
    const state = {
        map: Array.from({ length: settings.size }, e => Array(settings.size).fill(null)),
        position: { x: 0, y: 0 },
        percepts: new Set(),
        score: 0,
        alive: true,
        arrows: 1,
    };
    state.map[state.position.y][state.position.x] = {
        type: Tile.Empty,
        percepts: new Set(),
    };
    return state;
}

export function getMap(settings) {
    const size = settings.size;
    const seed = settings.seed;
    const pitchance = 0.15;
    const rand = new Random(`${seed}x${size}`);

    const map = Array.from({ length: size }, _ => Array.from({ length: size }, _ => {
        return { type: Tile.Empty, percepts: new Set() };
    }));

    const maxTries = 10;

    function addPercept(percept, x, y) {
        if (x >= 0 && x < size && y >= 0 && y < size) {
            map[y][x].percepts.add(percept);
        }
    }

    function setTile(type, percept, perceptPos, validPos) {
        let x = Math.round(rand.random() * (size - 1));
        let y = Math.round(rand.random() * (size - 1));
        for (let tries = 0; tries < maxTries; tries++) {
            if (validPos(x, y) && map[y][x].type === Tile.Empty) {
                map[y][x].type = type;
                for (let pos of perceptPos) {
                    addPercept(percept, x + pos[0], y + pos[1]);
                }
                break;
            }
            x = Math.round(rand.random() * (size - 1));
            y = Math.round(rand.random() * (size - 1));
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
                        && map[row][col].type === Tile.Pit)
                        return false;
                }
            }
            return true;
        });
    }

    return map;
}

export function createScenario(settings) {
    const state = getInitialState(settings);
    const map = getMap(settings);

    return Object.freeze({
        getState() { return deepCopy(state); },
        hasWon() { return state.percepts.has(Percept.Glitter); },

        getActions() {
            const actions = [];
            if (state.arrows > 0)
                actions.push({ type: Action.ShootUp }, { type: Action.ShootDown }, { type: Action.ShootLeft }, { type: Action.ShootRight });
            if (settings.complexity === 2)
                actions.push({ type: Action.MoveUp }, { type: Action.MoveDown }, { type: Action.MoveLeft }, { type: Action.MoveRight });
            else {
                for (let y = 0; y < settings.size; y++) {
                    for (let x = 0; x < settings.size; x++) {
                        if (state.map[y][x] === null && (
                            (x > 0 && state.map[y][x - 1] !== null) || (x < (settings.size - 1) && state.map[y][x + 1] !== null)
                            || (y > 0 && state.map[y - 1][x] !== null) || (y < (settings.size - 1) && state.map[y + 1][x] !== null)))
                            actions.push({ type: Action.MoveTo, x, y });
                    }
                }
            }
            return actions;
        },

        validateAction(action) {
            // directional move is always valid
            if (action.type === Action.MoveUp || action.type === Action.MoveDown
                || action.type === Action.MoveLeft || action.type === Action.MoveRight)
                return true;
            // you can only shoot when there are arrows left
            if (state.arrows > 0 && action.type === Action.ShootUp || action.type === Action.ShootDown
                || action.type === Action.ShootLeft || action.type === Action.ShootRight)
                return true;
            // moveto only adjacent to explored tiles
            const x = action.x;
            const y = action.y;
            if (action.type === Action.MoveTo && (
                (x > 0 && state.map[y][x - 1] !== null) || (x < (settings.size - 1) && state.map[y][x + 1] !== null)
                || (y > 0 && state.map[y - 1][x] !== null) || (y < (settings.size - 1) && state.map[y + 1][x] !== null))
            ) {
                return true;
            }
            throw Error(`invalid action ${action.type}`);
        },

        validAction(action) {
            try {
                this.validateAction(action);
                return true;
            }
            catch (e) {
                return false;
            }
        },

        performAction(action) {
            this.validateAction(action);
            state.percepts = new Set();

            if (action.type === Action.MoveUp) state.position.y--;
            if (action.type === Action.MoveDown) state.position.y++;
            if (action.type === Action.MoveLeft) state.position.x--;
            if (action.type === Action.MoveRight) state.position.x++;
            if (action.type === Action.MoveTo) { state.position.x = action.x; state.position.y = action.y };

            if (state.position.x < 0) { state.percepts.add(Percept.Bump); state.position.x = 0; }
            if (state.position.x >= settings.size) { state.percepts.add(Percept.Bump); state.position.x = settings.size - 1; }
            if (state.position.y < 0) { state.percepts.add(Percept.Bump); state.position.y = 0; }
            if (state.position.y >= settings.size) { state.percepts.add(Percept.Bump); state.position.y = settings.size - 1; }

            const x = state.position.x;
            const y = state.position.y;

            if(action.type === Action.ShootUp){
                state.arrows--;
                if(y > 0 && map[y-1][x].type === Tile.Wumpus){
                    map[y-1][x].type = Tile.Empty;
                    state.percepts.add(Percept.Scream);
                }
            }
            if(action.type === Action.ShootDown){
                state.arrows--;
                if(y < settings.size-2 && map[y+1][x].type === Tile.Wumpus){
                    map[y+1][x].type = Tile.Empty;
                    state.percepts.add(Percept.Scream);
                }
            }
            if(action.type === Action.ShootLeft){
                state.arrows--;
                if(x > 0 && map[y][x-1].type === Tile.Wumpus){
                    map[y][x-1].type = Tile.Empty;
                    state.percepts.add(Percept.Scream);
                }
            }
            if(action.type === Action.ShootRight){
                state.arrows--;
                if(x < settings.size-2 && map[y][x+1].type === Tile.Wumpus){
                    map[y][x+1].type = Tile.Empty;
                    state.percepts.add(Percept.Scream) ;
                }
            }

            state.map[y][x] = map[y][x];
            map[y][x].percepts.forEach(percept => state.percepts.add(percept) );

            if (state.map[y][x].type === Tile.Pit
                || state.map[y][x].type === Tile.Wumpus) {
                state.alive = false;
            }

            let score = -1;
            if (!state.alive)
                score = -1000;
            if (state.percepts.has(Percept.Glitter))
                score = 1000;

            state.score += score;
            return score;
        },

        async run(player, update = true) {
            if (player.init instanceof Function)
                await player.init(this.getState());
            if (update)
                await updateGUI(state, map);

            while (!this.hasWon() && state.alive && state.score > -1000) {
                const oldState = this.getState();
                const actions = this.getActions();
                const action = await player.update(oldState, actions);
                const score = this.performAction(action);

                let event = action.type;
                if(event === Action.MoveTo)
                    event += ` ${action.x},${action.y}`;
                const events = [event];
                events.push(`Percepts: [${[...state.percepts].join(',')}]`);
                if (state.alive === false)
                    events.push('You died!');
                if (this.hasWon())
                    events.push('You found the gold!');
                if (player.result instanceof Function)
                    await player.result(oldState, action, this.getState(), score);
                if (update)
                    await updateGUI(state, map, events);
            }

            if (player.finish instanceof Function) {
                const state = this.getState();
                await player.finish(state);
            }
        }
    });
}

export async function run(settings){
    const scenario = createScenario(settings);
    const player = await hideImport('/project/index.js'); // gets ignored by webpack
    await scenario.run(player);
}