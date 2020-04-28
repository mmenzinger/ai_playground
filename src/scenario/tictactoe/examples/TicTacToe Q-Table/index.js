import { QTable } from '/project/qtable.js';
import { generateQTable } from '/project/train.js';
import { createScenario } from '/scenario/tictactoe/scenario.js';

let qtable = new QTable();


export async function init(){
    console.log('loading qtable');
    await qtable.load();
}

export async function update(state, actions){
    const scenario = createScenario(state);
    const action = qtable.getBestValidAction(scenario);
    return action;
}

export async function finish(state, score){
    console.log('final state: ', state);
    console.log('score: ', score);
}

export async function train(){
    await generateQTable();
}