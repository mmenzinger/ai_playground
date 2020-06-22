import { EComplexity, createState, run } from 'project/scenario.js';

const SETTINGS = {
    complexity: EComplexity.Simple,
    size: 4,
    seed: '42',
    delay: 200,
};

export async function update(state, actions){
    // take a random action
    const action = Math.round(Math.random()*(actions.length-1));
    return actions[action];
}

export async function finish(state, score){
    console.log('score: ', score);
}

export async function start() {
    const state = createState(SETTINGS);
    const player = { update, finish }
    await run(state, player, SETTINGS.delay);
}