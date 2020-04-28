import { Action } from '/scenario/wumpus/scenario.js';
// import tau-prolog
import pl from '/libs/prolog.js';

// global variable for knowledge base
const kb = pl.create();

// return an array of unique elements
// used for debugging purposes when prolog returns the same answer multiple 
// times
function unique(array){
    return [...new Set(array.map(x => JSON.stringify(x)))]
        .map(x => JSON.parse(x));
}

// shuffle an array, used to randomize equal actions
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

export async function init(state){
    // load knowledge base
    await kb.consult('knowledge.pl');
    // set map size and starting tile
    await kb.asserta(`size(${state.map.length})`);
    await kb.asserta(`visited(0,0)`);
}

export async function update(state, actions){
    const x = state.position.x;
    const y = state.position.y;
    
    // update knowledge base with percepts
    for(const percept of state.percepts){
        switch(percept){
            case 'Breeze':
                await kb.run(`asserta(breeze(${x},${y})).`);
                break;
            case 'Stench':
                await kb.run(`asserta(stench(${x},${y})).`);
                break;
            case 'Scream':
                await kb.run(`asserta(scream).`);
                break;
            case 'Glitter':
                // this one doesn't matter since the scenario is over at this point
                break;
        }
    };

    // shoot wumpus if possible
    if(state.arrows > 0 && state.percepts.has('Stench')){
        if(await kb.isTrue(`certainWumpus(${x-1}, ${y}).`))
            return {type: Action.ShootLeft};
        if(await kb.isTrue(`certainWumpus(${x+1}, ${y}).`))
            return {type: Action.ShootRight};
        if(await kb.isTrue(`certainWumpus(${x}, ${y-1}).`))
            return {type: Action.ShootUp};
        if(await kb.isTrue(`certainWumpus(${x}, ${y+1}).`))
            return {type: Action.ShootDown};
    }
    
    // make a save move whenever possible
    for(const action of shuffle(actions)){
        if(action.type === 'MoveTo'){
            if(await kb.isTrue(`saveMove(${action.x}, ${action.y}).`)){
                return action;
            }
        }
    }
    
    // make a possibly non fatal action
    console.log("no save action taking chance!");
    //kb.query(`certainPit(X,Y).`);
    //console.log('pits:', unique(await kb.answers()));
    for(const action of shuffle(actions)){
        if(action.type === 'MoveTo'){
            if(await kb.isTrue(`unsaveMove(${action.x}, ${action.y}).`)){
                return action;
            }
        }
    }
    
    console.warn("impossible!");
    // take a random (at this point certainly fatal) action
    const action = Math.round(Math.random()*(actions.length-1));
    return actions[action];
}

export async function result(oldState, action, state, score){
    const x = state.position.x;
    const y = state.position.y;
    await kb.asserta(`visited(${x},${y})`);
}

export async function finish(state, score){
    console.log('score: ', state.score);
}