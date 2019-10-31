export const TicTacToeMinMax = {
    name: 'TicTacToe - Example MinMax',
    files: [
        {
            name: 'index.js',
            content: 
`//importScripts(global('filename.js));
//importScripts('filename.js);

function recGetScore(state, action, depth){
    const newState = scenario.performAction(state, action);
    const winner = scenario.getWinner(newState);
    if(winner !== scenario.Player.None)
        return scenario.getScore(newState) / 4**depth;
    
    let score = 0;
    const actions = scenario.getActions(newState);
    actions.forEach(action => {
        score +=  recGetScore(newState, action, depth+1);
    });
    return score;
}

function getBestAction(state){
    const score = scenario.getScore(state);
    const actions = scenario.getActions(state);
    let bestScore = -Infinity;
    let bestAction = actions[0];
    actions.forEach(action => {
        const score = recGetScore(state, action, 0);
        if(score > bestScore){
            bestScore = score;
            bestAction = action;
        }
    });
    return {action: bestAction, score: bestScore};
}

async function init(state){
}

async function update(state, actions){
    const best = getBestAction(state);
    console.log(best);
    return best.action;
}

async function finish(state, score){
    console.log(\`finish with score: \${score}\`);
}`,
        }
    ]
}

export default TicTacToeMinMax;