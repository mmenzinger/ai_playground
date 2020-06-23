import { QTable } from 'project/qtable.js';
import { generateQTable } from 'project/train.js';
import { EPlayer, createState, run } from 'project/scenario.js';

const SETTINGS = {
    startingPlayer: EPlayer.Computer,
};

let qtable = new QTable();

export async function start(){
    const state = createState(SETTINGS);
    const computer = { init, update };
    return await run(state, computer);
}

export async function init(){
    console.log('loading qtable');
    await qtable.load();
}

export async function update(state, actions){
    const action = qtable.getBestValidAction(state);
    return action;
}

export async function train(){
    await generateQTable();
}