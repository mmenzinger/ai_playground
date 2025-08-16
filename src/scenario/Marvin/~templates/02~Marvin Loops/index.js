import {run, moveForward, turnLeft, turnRight } from 'project/scenario.js';

const settings = {
    level: 2, // level from 0 to 8
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
 * For bigger levels using loops is recommendet!
 */
async function init(){
    moveForward()
    for(let i = 0; i < 3; i++){
        moveForward()
        turnLeft()
    }
    turnRight()
}