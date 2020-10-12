// import the scenario module
import * as $ from 'project/scenario.js';
import * as _ from 'lib/utils.js';

const USE_MOUSE_INPUT = true;

const RENDER = true;
const FRAME_DELAY = 5;
const MAX_SCORE = 100;

let click = false;


export async function start(){
    const settings = $.Settings(MAX_SCORE);
    const agent = $.Agent({init, update, finish});
    $.run(settings, agent, RENDER, FRAME_DELAY);
}


async function init(){
    if(USE_MOUSE_INPUT){
        await new Promise((resolve) => {
            _.onMouseDown(() => {
                click = true;
                resolve();
            });
        });
    }
}

/** @param {$.Observations} obs */
async function update(obs){
    let action = $.EAction.Idle;

    // play with mouse
    if(USE_MOUSE_INPUT){
        if(click){
            action = $.EAction.Jump;
            click = false;
        }
    }
    // else 2% chance to jump
    else if(Math.random() < 0.1){
        action = $.EAction.Jump;
    }

    return action;
}

/** 
 * @param {number} score
 * @param {boolean} alive
 */
async function finish(score, alive){
    console.log(`Game ends with a score of ${score} and the bird is ${alive ? 'still alive' : 'dead'}.`);
}


export async function train(){
    // use a learning algorithm to train your bird!
}