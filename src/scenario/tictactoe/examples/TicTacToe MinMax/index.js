import { createScenario, Player } from '/scenario/tictactoe/scenario.js';

//------------------------------------------------------------------------------
// pseudo-randomly shuffle an array
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

//------------------------------------------------------------------------------
// calculates the least harmful action for the player
// returns the calculated score, action and the number 
// of simulated turns
function minmax(scenario, player = Player.Computer) {
    const oponent = player % 2 + 1; // switch between player 1 and 2
    
    // when there is a winner return the resulting score
    // recursive functions NEED an exit condition
    const winner = scenario.getWinner();
    if(winner !== Player.None){
        return [scenario.getScore(player), null, 0];
    }

    let bestAction = null;
    let bestScore = -Infinity;
    // count the simulated turns; not needed but interesting
    let turnsSimulated = 0;

    // shuffle actions just to spice things up; remove shuffle to increase
    const actions = shuffle(scenario.getActions());
    for(const action of actions){
        // make a copy of the scenario; without this all simulated moves would
        // take place at the same board which basically breaks everything...
        const newScenario = scenario.clone();
        newScenario.performAction(action);
        turnsSimulated++;

        // based on the new state simulate further turns
        const [oponentScore, _, turns] = minmax(newScenario, oponent);
        const score = -oponentScore; // good for the oponent means bad for you
        turnsSimulated += turns;
        // picking the best action results in the lowest score for the oponent
        if(score > bestScore){
            bestAction = action;
            bestScore = score;
        }
    }

    return [bestScore, bestAction, turnsSimulated];
}

//------------------------------------------------------------------------------
export async function update(state, actions) {
    // create a scenario based on the state; to be able to easily access the 
    // whole game logic
    const scenario = createScenario(state);

    // calculate best action
    const [score, action, turns] = minmax(scenario);

    console.log(turns, 'turns simulated');
    console.log('best action with value', score, 'is', action);

    // perform action
    return action;
}

//------------------------------------------------------------------------------
export async function init(state){
    console.log('game started');
    if(state.player === Player.Computer){
        console.log('calculating first action...');
    }
    else{
        console.log('waiting for player action...');
    }
}