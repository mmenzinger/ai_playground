import * as $ from 'project/scenario.js';

//------------------------------------------------------------------------------
const SETTINGS = {
    startingPlayer: $.EPlayer.Computer,
};

//------------------------------------------------------------------------------
export async function start() {
    const state = $.createState(SETTINGS);
    const player = { update, finish }
    await $.run(state, player);
}

//------------------------------------------------------------------------------
async function update(state, actions){
    // take a random action
    const action = Math.round(Math.random()*(actions.length-1));
    return actions[action];
}

//------------------------------------------------------------------------------
async function finish(state, score){
    console.log('score: ', score);
}