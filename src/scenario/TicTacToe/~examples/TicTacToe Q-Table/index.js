import { QTable } from 'project/qtable.js';
import { generateQTable } from 'project/train.js';
import * as $ from 'project/scenario.js';

//------------------------------------------------------------------------------
const SETTINGS = {
    startingPlayer: $.EPlayer.Computer,
};

let qtable = new QTable();

//------------------------------------------------------------------------------
export async function start(){
    const state = $.createState(SETTINGS);
    const computer = { init, update };
    return await $.run(state, computer);
}

//------------------------------------------------------------------------------
export async function train(){
    await generateQTable();
}

//------------------------------------------------------------------------------
async function init(){
    console.log('loading qtable');
    await qtable.load();
}

//------------------------------------------------------------------------------
async function update(state, actions){
    const action = qtable.getBestValidAction(state);
    return action;
}