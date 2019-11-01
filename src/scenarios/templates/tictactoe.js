export const TicTacToe = {
    name: 'TicTacToe',
    files: [
        {
            name: 'index.js',
            content: 
`//include('filename.js);

async function init(state){
    console.log('initial state: ', state);
}

async function update(state, actions){
    // take a random action
    const action = Math.round(Math.random()*(actions.length-1));
    return actions[action];
}

async function finish(state, score){
    console.log('final state: ', state);
    console.log('score: ', score);
}`,
        }
    ]
}

export default TicTacToe;