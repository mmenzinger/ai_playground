class Random{
    constructor(seed){
        this.mask = 0xffffffff;
        this.m_w = (123456789 + seed) & this.mask;
        this.m_z = (987654321 - seed) & this.mask;
        
    }

    // Returns number between 0 (inclusive) and 1.0 (exclusive),
    random()
    {
        this.m_z = (36969 * (this.m_z & 65535) + (this.m_z >> 16)) & this.mask;
        this.m_w = (18000 * (this.m_w & 65535) + (this.m_w >> 16)) & this.mask;
        var result = ((this.m_z << 16) + (this.m_w & 65535)) >>> 0;
        result /= 4294967296;
        return result;
    }
}


function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
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


const ActionType = Object.freeze({
    Wait: 0,
    Move: 1 << 2,
    Shoot: 1 << 3,
});

const Direction = Object.freeze({
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3,
});

export const Percept = Object.freeze({
    None: 0,
    Bump: 1 << 1,
    Breeze: 1 << 2,
    Stench: 1 << 3,
    Scream: 1 << 4,
    Glitter: 1 << 5,
});

export const Action = Object.freeze({
    Wait: 0,
    MoveUp: ActionType.Move | Direction.Up,
    MoveDown: ActionType.Move | Direction.Down,
    MoveLeft: ActionType.Move | Direction.Left,
    MoveRight: ActionType.Move | Direction.Right,
    ShootUp: ActionType.Shoot | Direction.Up,
    ShootDown: ActionType.Shoot | Direction.Down,
    ShootLeft: ActionType.Shoot | Direction.Left,
    ShootRight: ActionType.Shoot | Direction.Right,
});

export const Tile = Object.freeze({
    Empty: 0,
    Pit: 1,
    Wumpus: 2,
    Gold: 3,
});

export function getInitialState(size) {
    const state = {
        map: Array.from({ length: size }, e => Array(size).fill(null)),
        position: { x: 0, y: 0 },
        percepts: Percept.None,
        score: 0,
        alive: true,
        arrows: 1,
    };
    state.map[state.position.y][state.position.x] = {
        type: Tile.Empty,
        percepts: Percept.None,
    };
    return state;
}

export function getMap(size, seed) {
    const rand = new Random(seed);

    const map = Array.from({ length: size }, _ => Array.from({ length: size }, _ => {
        return { type: Tile.Empty, percept: Percept.None };
    }));

    const maxTries = 10;

    function addPercept(percept, x, y){
        if(x >= 0 && x < size && y >= 0 && y < size){
            map[y][x].percept |= percept;
        }
    }

    function setTile(type, percept, perceptPos, validPos){
        let x = Math.round(rand.random()*(size - 1));
        let y = Math.round(rand.random()*(size - 1));
        for(let tries = 0; tries < maxTries && (!validPos(x, y) || map[y][x].type !== Tile.Empty); tries++){
            x = Math.round(rand.random()*(size - 1));
            y = Math.round(rand.random()*(size - 1));
        }
        map[y][x].type = type;
        for(let pos of perceptPos){
            addPercept(percept, x+pos[0], y+pos[1]);
        }
    }

    const spot = [[0,0]];
    const cross = [[0,0],[-1,0],[1,0],[0,-1],[0,1]];

    for(let pit = 0; pit < size**2 * 0.2 - 1; pit++)
        setTile(Tile.Pit, Percept.Breeze, cross, (x,y) => x>1 || y>1);
    setTile(Tile.Wumpus, Percept.Stench, cross, (x,y) => x>1 || y>1);
    setTile(Tile.Gold, Percept.Glitter, spot, (x,y) => x>=size/2 || y>=size/2);
    
/*
    x = Math.round(rand.random()*(size - 1));
    y = Math.round(rand.random()*(size - 1));
    for(let tries = 0; tries < maxTries && (((x < 2 && y < 2) || map[y][x].type === Tile.Empty)); tries++){
        x = Math.round(rand.random()*(size - 1));
        y = Math.round(rand.random()*(size - 1));
    }
    map[y][x].type = Tile.Wumpus;
    addPercept(Percept.Stench, x, y);
    addPercept(Percept.Stench, x-1, y-1);
    addPercept(Percept.Stench, x-1, y+1);
    addPercept(Percept.Stench, x+1, y-1);
    addPercept(Percept.Stench, x+1, y+1);

    // 20% pits
    for(let pit = 0; pit < size**2 * 0.2; pit++){
        for(let i = 0; i < 10; i++){

        }
    }
    map[Math.round(rand.random() * (size - 1))][Math.round(rand.random() * (size - 1))] = {
        type: Tile.Wumpus,
        percept: Percept.Stench,
    };
    map[Math.round(rand.random() * (size - 1))][Math.round(rand.random() * (size - 1))] = {
        type: Tile.Gold,
        percept: Percept.Gold,
    };*/
    return map;
}

export function createScenario(settings) {
    const state = getInitialState(settings.size);
    const map = getMap(settings.size, settings.seed);

    return Object.freeze({
        getState() { return deepCopy(state); },
        hasWon() { return state.percept & Percept.Glitter; },

        getActions() {
            const actions = [];
            for (let [key, value] of Object.entries(Action)) {
                if (state.arrows <= 0 && value & ActionType.Shoot)
                    continue;
                actions.push({ type: key });
            }
            return actions;
        },

        validateAction(action) {
            for (let a of Object.keys(Action)) {
                //console.log(a, action);
                if (a === action.type)
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

            if (Action[action.type] & ActionType.Move) {
                if ((Action[action.type] & 3) === Direction.Right) { state.position.x++; }
                if ((Action[action.type] & 3) === Direction.Left) { state.position.x--; }
                if ((Action[action.type] & 3) === Direction.Up) { state.position.y--; }
                if ((Action[action.type] & 3) === Direction.Down) { state.position.y++; }
            }
            if (state.position.x < 0) { state.percept |= Percept.Bump; state.position.x = 0; }
            if (state.position.x >= settings.size) { state.percept |= Percept.Bump; state.position.x = settings.size - 1; }
            if (state.position.y < 0) { state.percept |= Percept.Bump; state.position.y = 0; }
            if (state.position.y >= settings.size) { state.percept |= Percept.Bump; state.position.y = settings.size - 1; }

            state.map[state.position.y][state.position.x] = map[state.position.y][state.position.x];
            state.percept |= state.map[state.position.y][state.position.x].percept;

            if (Action[action.type] & ActionType.Shoot) {
                state.arrows--;
            }

            if (state.map[state.position.y][state.position.x].type === Tile.Pit
                || state.map[state.position.y][state.position.x].type === Tile.Wumpus) {
                state.alive = false;
            }

            let score = -1;
            if (!state.alive)
                score = -1000;
            if (state.percept & Percept.Glitter)
                score = 1000;

            state.score += score;
            return score;
        },

        async run(player, update = true) {
            if(update)
                await updateGUI(state, map);
            if (player.init instanceof Function)
                await player.init(this.getState());

            while (!this.hasWon() && state.alive && state.score > -1000) {
                const oldState = this.getState();
                const actions = this.getActions();
                const action = await player.update(oldState, actions);
                const score = this.performAction(action);
                const events = [action.type];
                if(state.alive === false)
                    events.push('You died!');
                if(this.hasWon())
                    events.push('You found the gold!');
                if(update)
                    await updateGUI(state, map, events);
                if (player.result instanceof Function)
                    await player.result(oldState, action, this.getState(), score);
            }

            if (player.finish instanceof Function) {
                const state = this.getState();
                await player.finish(state);
            }
        }
    });
}