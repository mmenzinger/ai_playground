import { QTable } from '/project/qtable.js';
import { generateQTable } from '/project/train.js';

let qtable = new QTable();


export async function init(){
    console.log('loading qtable');
    await qtable.load();
}

export async function update(state, actions){
    const action = qtable.getBestValidAction(state);
    return action;
}

export async function finish(state, score){
    console.log('final state: ', state);
    console.log('score: ', score);
}

export async function train(){
    await generateQTable();
}