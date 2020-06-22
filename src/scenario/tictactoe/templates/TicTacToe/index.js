import { createState, run, EPlayer } from 'project/scenario.js';

const SETTINGS = {
    startingPlayer: EPlayer.Computer,
};

export async function start(){
    const state = createState(SETTINGS);
    const computer = { init, update, finish };
    return await run(state, computer);
}

async function init(state){
    console.log('Let the game beginn...');
}

async function update(state, actions){
    // take a random action
    const action = Math.round(Math.random()*(actions.length-1));
    return actions[action];
}

async function finish(state, score){
    switch(score){
        case 1: console.log('The computer has won!'); break;
        case 0: console.log('Draw!'); break;
        case -1: console.log('The player has won!'); break;
    }
}
