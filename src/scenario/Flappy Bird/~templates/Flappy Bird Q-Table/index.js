import * as $ from 'project/scenario.js';
import * as _ from 'lib/utils.js';
import { QTable } from 'project/qtable.js';
import { generateQTable, observationsToState } from 'project/train_basic.js';

// whether to use mouse input or a qtable
const USE_MOUSE_INPUT = true;

// render the game or use only console
const RENDER = true;
// delay between frames (can be negative to speed up)
const FRAME_DELAY = 5;
// max score after which the game ends
const MAX_SCORE = 1000;

// global qtable object
const qtable = new QTable();
// global click variable for mouse interaction
let click = false;


/**
 * Async callback when the 'start/restart'-button is pressed. 
 * @return {Promise<void>} 
 */
export async function start() {
    const settings = $.Settings(MAX_SCORE);
    const agent = $.Agent({ init, update, finish });
    $.run(settings, agent, RENDER, FRAME_DELAY);
}

/**
 * Async callback when the 'call train'-button is pressed. 
 * @return {Promise<void>} 
 */
export async function train() {
    await generateQTable();
}

/**
 * Async agent-callback when the game starts. 
 * @return {Promise<void>} 
 */
async function init() {
    if (USE_MOUSE_INPUT) {
        console.log("Click on the game to start!")
        // wait for the first mouse click
        await new Promise((resolve) => {
            _.onMouseDown(() => {
                click = true;
                resolve();
            });
        });
    }
    else {
        await qtable.load();
    }
}

/**
 * Async agent-callback to decide which action to take.
 * Must return a number representing an EAction.
 * @param {$.Observations} obs 
 * @return {Promise<$.EAction>} 
 */
async function update(obs) {
    let action = $.EAction.Idle;

    // play with mouse
    if (USE_MOUSE_INPUT) {
        if (click) {
            action = $.EAction.Jump;
            click = false;
        }
    }
    // use qtable
    else {
        const state = observationsToState(obs);
        action = qtable.getBestAction(state);
    }

    return action;
}

/** 
 * Async agent-callback when the game is finished.
 * @param {number} score
 * @param {boolean} alive
 * @return {Promise<void>}
 */
async function finish(score, alive) {
    console.log(`Game ends with a score of ${score} and the bird is ${alive ? 'still alive' : 'dead'}.`);
}