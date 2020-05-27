//import * as scenario from 'scenario/tictactoe.js';

export async function init(state){
    console.log('initial state: ', state);
}

export async function update(state, actions){
    // take a random action
    const action = Math.round(Math.random()*(actions.length-1));
    return actions[action];
}

export async function finish(state, score){
    console.log('final state: ', state);
    console.log('score: ', score);
}