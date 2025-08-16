import {run, moveForward, turnLeft, turnRight } from 'project/scenario.js';

const settings = {
    level: 3, // level from 0 to 8
    delay: 500, // delay between actions in milliseconds
}

export async function start(){
    const agent = {init} // use fixed action sequence
    run(agent, settings) // start the scenario
}

/**
 * This function is only called once, at the beginning of the scenario.
 * It can be used to preprogram a sequence of actions the robot will 
 * then follow.
 * For bigger levels using loops and functions is recommendet!
 */
async function init(){
    forward(5)
    turnLeft()
    forward(3)
}

/**
 * Here are your custom functions.
 * Add more as you need them!
 */
function forward(steps){
    for(let i = 0; i < steps; i++){
        moveForward()
    }
}