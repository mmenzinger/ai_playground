import * as $ from 'project/scenario.js';
import { pl } from 'lib/prolog.js';

//------------------------------------------------------------------------------
const SETTINGS = {
    complexity: $.EComplexity.Simple,
    size: 4,
    seed: '42',
    delay: 200,
};

//------------------------------------------------------------------------------
// global variable for knowledge base
const kb = pl.create();

//------------------------------------------------------------------------------
export async function start() {
    const state = $.createState(SETTINGS);
    const player = { init, update, result, finish }
    await $.run(state, player, SETTINGS.delay);
}

//------------------------------------------------------------------------------
// return an array of unique elements
// used for debugging purposes when prolog returns the same answer multiple 
// times
function unique(array){
    return [...new Set(array.map(x => JSON.stringify(x)))]
        .map(x => JSON.parse(x));
}

//------------------------------------------------------------------------------
// shuffle an array, used to randomize equal actions
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

//------------------------------------------------------------------------------
async function init(state){
    // load knowledge base
    await kb.consult('knowledge.pl');
    // set map size and starting tile
    await kb.asserta(`size(${state.size})`);
    await kb.asserta(`visited(0,0)`);
}

//------------------------------------------------------------------------------
async function update(state, actions){
    const x = state.position.x;
    const y = state.position.y;

    // update knowledge base with percepts
    if(state.percepts & $.EPercept.Breeze){
        await kb.run(`asserta(breeze(${x},${y})).`);
    }
    if(state.percepts & $.EPercept.Stench){
        await kb.run(`asserta(stench(${x},${y})).`);
    }
    if(state.percepts & $.EPercept.Scream){
        await kb.run(`asserta(scream).`);
    }

    // shoot wumpus if possible
    if(state.arrows > 0 && state.percepts & $.EPercept.Stench){
        if(await kb.isTrue(`certainWumpus(${x-1}, ${y}).`))
            return {type: $.EAction.ShootLeft};
        if(await kb.isTrue(`certainWumpus(${x+1}, ${y}).`))
            return {type: $.EAction.ShootRight};
        if(await kb.isTrue(`certainWumpus(${x}, ${y-1}).`))
            return {type: $.EAction.ShootUp};
        if(await kb.isTrue(`certainWumpus(${x}, ${y+1}).`))
            return {type: $.EAction.ShootDown};
    }

    // make a save exploration move whenever possible
    for(const action of shuffle(actions)){
        if(action.type === $.EAction.MoveTo){
            if(await kb.isTrue(`
                \\+visited(${action.x}, ${action.y}),
                saveMove(${action.x}, ${action.y}).
            `)){
                return action;
            }
        }
    }

    // try to move adjacent to wumpus to kill
    for(const action of actions){
        if(action.type === $.EAction.MoveTo){
            if(await kb.isTrue(`
                \\+visited(${action.x}, ${action.y}),
                certainWumpus(${action.x}, ${action.y}).
            `)){
                for(const action2 of actions){
                    if(action2.type === $.EAction.MoveTo){
                        if(await kb.isTrue(`
                            visited(${action2.x}, ${action2.y}),
                            adjacent(${action.x}, ${action.y}, ${action2.x}, ${action2.y}).
                        `)){
                            return action2;
                        }
                    }
                }
            }
        }
    }
    
    // make a possibly non fatal action
    console.log("no save action taking chance!");
    for(const action of shuffle(actions)){
        if(action.type === $.EAction.MoveTo){
            if(await kb.isTrue(`
                \\+visited(${action.x}, ${action.y}),
                unsaveMove(${action.x}, ${action.y}).
            `)){
                return action;
            }
        }
    }
    
    console.warn("impossible?");
    // take a random (at this point certainly fatal) action
    const action = Math.round(Math.random()*(actions.length-1));
    return actions[action];
}

//------------------------------------------------------------------------------
async function result(oldState, action, state, score){
    const x = state.position.x;
    const y = state.position.y;
    await kb.asserta(`visited(${x},${y})`);
}

//------------------------------------------------------------------------------
async function finish(state, score){
    console.log('score: ', state.score);
}