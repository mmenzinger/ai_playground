export const TicTacToe = {
    name: 'TicTacToe',
    files: [
        {
            name: 'index.js',
            content: 
`//importScripts(global('filename.js));
//importScripts('filename.js);

async function init(state){
}

async function update(state, actions){
    // take a random action
    const action = Math.round(Math.random()*(actions.length-1));
    return actions[action];
}

async function finish(state, score){
    console.log(\`finish with score: \${score}\`);
}`,
        }
    ]
}

export default TicTacToe;