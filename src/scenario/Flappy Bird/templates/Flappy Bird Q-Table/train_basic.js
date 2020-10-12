import { QTable } from 'project/qtable.js';
import * as $ from 'project/scenario.js';
import * as _ from 'lib/utils.js';

// every n-th episode that shall be rendered (0 if none)
const showProgressFrequency = 1;
// skip n frames for speedup during rendering
const renderFrameSkip = 0;

/** 
 * Function to map the Observations to a state.
 * The state must be either numeric or a string.
 * @param {$.Observations} obs
 * @return {number | string}
 */
export function observationsToState(obs) {
    // return a string containing both numbers as the state
    /*
        TODO: return a state that is a good representation of the
        given observations.
    */
    // this example is probably not the best representation to use...
    // but why?
    return `${obs.horizontalDistance},${obs.verticalDistance}`;
}

/** 
 * Async function to train the agend by building a qtable.
 * @return {Promise<void>}
 */
export async function generateQTable() {
    // create a new qtable and limit its values ranging from -1 to 1
    const qtable = new QTable(0, -1, 1);

    /*
        TODO: choose good values for alpha, gamma, epochs, episodes and maxScore
        Why are the curr
    */
    const alpha = 1.0; // learning rate (0-1)
    const gamma = 1.0; // discount factor (0-1)
    const epochs = 5; // number of epochs
    const episodes = 100; // number of episodes per epoch
    const maxScore = 10; // max score of each episode

    const agent = $.Agent({
        /**
         * Async update-callback to decide which action to take.
         * @param {$.Observations} obs
         * @return {Promise<$.EAction>}
         */
        async update(obs) {
            const state = observationsToState(obs);
            const action = qtable.getBestAction(state);
            return action;
        },
        /**
         * Async result-callback, called after update has been resolved.
         * @param {$.Observations} obs
         * @param {$.EAction} action
         * @param {$.Observations} newObs
         * @param {boolean} alive
         * @return {Promise<void>}
         */
        async result(obs, action, newObs, alive) {
            // create the old and new states
            const s_t0 = observationsToState(obs);
            const s_t1 = observationsToState(newObs);
            // only update when the states are different
            if (s_t0 !== s_t1 || !alive) {
                /*
                    TODO: update the q-value for the given state s_t0 and action
                */
                qtable.set(s_t0, action, 0);
            }
        }
    });

    // for each epoch...
    for (let epoch = 0; epoch < epochs; epoch++) {
        console.log(`training episodes ${epoch * episodes} - ${(epoch + 1) * episodes}`);

        // ...run each episode and accumulate the score
        let scoreAccumulated = 0;
        for (let episode = 0; episode < episodes; episode++) {
            // render only when the number of trainings correlates to 
            // the showProgressFrequency
            const countTrainings = episode + epoch * epochs;
            const render = countTrainings % showProgressFrequency === 0;
            if(render){
                await qtable.render(observationsToState);
            }
            // create and run a game given the settings
            const settings = $.Settings(maxScore);
            const score = await $.run(settings, agent, render, -renderFrameSkip);
            scoreAccumulated += score;
        }
        // print the score average and render the current state of the qtable
        console.log(`average score: ${scoreAccumulated / episodes}`);
        await qtable.render(observationsToState);
    }

    // save the qtable into a json-file
    await qtable.store('qtable');
    console.log('training finished!');
}

