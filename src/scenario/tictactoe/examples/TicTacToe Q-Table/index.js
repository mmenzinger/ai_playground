import { QTable } from 'http:/project/qtable.js';
import { generateQTable } from 'http:/project/train.js';

let qtable = new QTable();


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