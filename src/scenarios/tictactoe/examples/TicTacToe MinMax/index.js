function recGetScore(state, action){
    const newState = S.performAction(state, action);
    const winner = S.getWinner(newState);
    if(winner !== S.Player.None)
        return S.getScore(newState);
    
    let score = 0;
    const actions = S.getActions(newState);
    actions.forEach(action => {
        score += 0.2 * recGetScore(newState, action);
    });
    return score;
}

function getBestAction(state){
    const actions = S.getActions(state);
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

export async function init(state){
    console.log('initial state: ', state);
}

export async function update(state, actions){
    const best = getBestAction(state);
    console.log(best);
    return best.action;
}

export async function finish(state, score){
    console.log('final state: ', state);
    console.log('score: ', score);
}