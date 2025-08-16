import { run, moveForward, turnLeft, turnRight, writeNumber, setState } from 'project/scenario.js';

const settings = {
    level: 0, // level from 0 to 8
    delay: 500, // delay between actions in milliseconds
}

export async function start(){
    const agent = {update}; // react to observations
    run(agent, settings); // start the scenario
}

/** 
 * This function is is called, whenever all actions are finished.
 * It can be used to add new actions depending on the observed
 * environment (e.g. only move when there is no wall in front).
 * Remember: return finishes the function, nothing else will be
 * executed until a new call to update occurs.
 * 
 * Hint type obs. to get a preview of the available observations
 * 
 * @param {import('project/scenario.js').Observations} obs
 */
async function update(obs){
    // display the current observations
    console.log(obs);

    // when there are walls all around, write 1, turn around and move forward
    // '&&' means 'and', so the following block is only executed if all
    // all the statements are true
    if(obs.wallLeft && obs.wallFront && obs.wallRight){
        // return a list of actions
        return [writeNumber(1), turnAround(), moveForward()]
        // after any return the rest of the update-function is skipped
        // update is then called again, after all actions are finished
    }
    // if there is a path forward, take it
    // '!' negates the statement, like if there is NOT a wall in front
    if(obs.wallLeft && !obs.wallFront && obs.wallRight){
        return [moveForward()]
    }

    // the robot can also dance if the number 1 is written
    // (this currently is useless, it just demonstrates how to react to a number)
    // '===' is used to check if number has a specific value
    // it can also be user to check if the robot is in a specific state like
    // if(obs.state === '???')
    if(obs.number === 1){
        return [turnAround(), turnAround(), moveForward()]
    }

    // none of the above rules apply, so just stand there confused ^^
    return [setState('???')]
}

/************************************************************************************
 * 
 * Helper Functions
 * 
 * You can create your own functions here!
 * 
 */ 
function turnAround(){
    return [turnLeft(), turnLeft()]
}