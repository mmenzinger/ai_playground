import * as $ from 'project/scenario.js';


const SETTINGS = {
    startingPlayer: $.EPlayer.Computer,
};


export async function start(){
    const state = $.createState(SETTINGS);
    const computer = { init, update };
    return await $.run(state, computer);
}

//------------------------------------------------------------------------------
export async function update(state, actions) {
    // calculate best action
    const [score, action, turns] = minmax(state);

    console.log(turns, 'turns simulated');
    console.log('best action with value', score, 'is', $.actionToObject(action));

    // perform action
    return action;
}

//------------------------------------------------------------------------------
export async function init(state){
    console.log('game started');
    if(state.player === $.EPlayer.Computer){
        console.log('calculating first action...');
    }
    else{
        console.log('waiting for player action...');
    }
}

//------------------------------------------------------------------------------
// pseudo-randomly shuffle an array
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

//------------------------------------------------------------------------------
// calculates the least harmful action for the player
// returns the calculated score, action and the number 
// of simulated turns
function minmax(state, player = $.EPlayer.Computer) {
    const oponent = player % 2 + 1; // switch between player 1 and 2
    
    // when there is a winner return the resulting score
    // recursive functions NEED an exit condition
    const winner = $.getWinner(state);
    if(winner !== $.EPlayer.None){
        return [$.getScore(state, player), null, 0];
    }

    let bestAction = null;
    let bestScore = -Infinity;
    // count the simulated turns; not needed but interesting
    let turnsSimulated = 0;

    // shuffle actions just to spice things up; remove shuffle to increase performance
    const actions = shuffle($.getActions(state));
    for(const action of actions){
        // make a copy of the scenario; without this all simulated moves would
        // take place at the same board which basically breaks everything...
        const newState = $.performAction(state, action);
        turnsSimulated++;

        // based on the new state simulate further turns
        const [oponentScore, _, turns] = minmax(newState, oponent);
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