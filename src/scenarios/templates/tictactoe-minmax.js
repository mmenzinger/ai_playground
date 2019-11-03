export const TicTacToeMinMax = {
    name: 'TicTacToe - Example MinMax',
    files: [
        {
            name: 'index.js',
            content: 
`function recGetScore(state, action){
    const newState = scenario.performAction(state, action);
    const winner = scenario.getWinner(newState);
    if(winner !== scenario.Player.None)
        return scenario.getScore(newState);
    
    let score = 0;
    const actions = scenario.getActions(newState);
    actions.forEach(action => {
        score += 0.2 * recGetScore(newState, action);
    });
    return score;
}

function getBestAction(state){
    const actions = scenario.getActions(state);
    let bestScore = -Infinity;
    let bestAction = actions[0];
    actions.forEach(action => {
        const score = recGetScore(state, action);
        if(score > bestScore){
            bestScore = score;
            bestAction = action;
        }
    });
    return {action: bestAction, score: bestScore};
}

async function init(state){
    console.log('initial state: ', state);
}

async function update(state, actions){
    const best = getBestAction(state);
    console.log(best);
    return best.action;
}

async function finish(state, score){
    console.log('final state: ', state);
    console.log('score: ', score);
}`,
        }
    ]
}

export default TicTacToeMinMax;