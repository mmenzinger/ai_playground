export const TicTacToeQTable = {
    name: 'TicTacToe - Example Q-Table',
    files: [
        {
            name: 'index.js',
            content: 
`include('qtable.js');
include('train.js');


let qtable = new QTable();


async function init(){
    console.log('loading qtable');
    await qtable.load();
}

async function update(state, actions){
    const action = qtable.getBestValidAction(state);
    return action;
}

async function finish(state, score){
    console.log('final state: ', state);
    console.log('score: ', score);
}`,
        },
        {
            name: 'qtable.js',
            content:
`class QTable{
    constructor(initialValue = 0){
        this._data = new Map();
        this._initialValue = initialValue;
    }
    
    stateToKey(state){
        return state.board.flat().reduce(
                (a,c,i) => a + c * 10**(8-i)
            , 0);
    }
    
    idToAction(id){
        return {
            type: "PLACE",
            row: Math.floor(id / 3),
            col: id % 3,
            player: Player.Computer,
        }
    }
    
    actionToId(action){
        return action.row*3 + action.col;
    }
    
    set(state, action, value){
        const key = this.stateToKey(state);
        const actionId = this.actionToId(action);
        if(this._data.has(key)){
            this._data.get(key)[actionId] = value;
        }
        else{
            const cols = new Array(9).fill(this._initialValue);
            cols[actionId] = value;
            this._data.set(key, cols);
        }
    }
    
    get(state, action = undefined){
        const key = this.stateToKey(state);
        if(!this._data.has(key)){
            if(action === undefined)
                return new Array(9).fill(this._initialValue);
            else
                return this._initialValue;
        }
        if(action === undefined){ // return full row
            return this._data.get(key);
        }
        const actionId = this.actionToId(action);
        return this._data.get(key)[actionId];
    }
    
    getBestValidAction(state){
        const actions = this.get(state).map((x,i) => [i, x]);
        actions.sort((a,b) => b[1] - a[1]);
    
        let bestAction;
        for(let i = 0; i < actions.length; i++){
            bestAction = this.idToAction(actions[i][0]);
            if(validAction(state, bestAction))
                break;
        }
        
        return bestAction;
    }
    
    async store(name = 'qtable'){
        await storeJson(name, this._data);
    }
    
    async load(name = 'qtable'){
        try{
            this._data = await loadJson(name);
        }
        catch(e){
            console.warn("no file to load!");
        }
    }
}`,
        },
        {
            name: 'train.js',
            content:
`async function trainInit(){
    qtable = new QTable(0);
    return 10; // update iterations
}

async function trainUpdate(iteration){
    const alpha = 0.4; // learning rate
    const gamma = 0.8; // discount factor
    const episodes = 5000;
    const epsilonStart = 1.0 / (iteration/2+1); // reduce random moves with iterations
    const epsilonCoverage = 0.8; // no random moves after 80% of episodes
    const epsilonDecline = epsilonStart / (episodes * epsilonCoverage);
    
    console.log(\`training episodes: \${episodes*iteration} - \${episodes*(iteration+1)}\`);
    
    let epsilon = epsilonStart;
    for(let episode = 0; episode < episodes; episode++){
        let state = {
            board: [[0,0,0],[0,0,0],[0,0,0]],
            player: Player.Human,
        }
        
        // player starts -> random move
        let playerActions = getActions(state);
        let actionId = Math.round(Math.random()*(playerActions.length-1));
        let playerAction = playerActions[actionId];
        state = performAction(state, playerAction);
        
        for(let move = 0; move < 5; move++){
            // computer turn
            let computerAction;
            if(Math.random() < epsilon){ // explore
                const computerActions = getActions(state);
                let actionId = Math.round(Math.random()*(computerActions.length-1));
                computerAction = computerActions[actionId];
            }
            else{ // use qtable to get best move
                const actions = qtable.get(state);
                computerAction = qtable.getBestValidAction(state, 0);
            }
            newState = performAction(state, computerAction);
            if(getWinner(newState) != Player.None){
                const score = getScore(newState, Player.Computer);
                qtable.set(state, computerAction, score);
                break; // terminate match
            }
            oldState = {...state};
            state = newState;
            
            // player turn -> random move
            playerActions = getActions(state);
            actionId = Math.round(Math.random()*(playerActions.length-1));
            playerAction = playerActions[actionId];
            newState = performAction(state, playerAction);
            
            if(getWinner(newState) != Player.None){
                const reward = getScore(newState, Player.Computer);
                const oldScore = qtable.get(oldState, computerAction);
                const newScore = (1-alpha)*oldScore + alpha*reward ;
                qtable.set(oldState, computerAction, newScore);
                break; // terminate match
            }
            else{
                const reward = getScore(newState, Player.Computer);
                const oldScore = qtable.get(oldState, computerAction);
                const bestNewScore = Math.max(...qtable.get(newState));
                const newScore = (1-alpha)*oldScore + alpha*(reward + gamma*bestNewScore);
                qtable.set(oldState, computerAction, newScore);
                state = newState;
            }
        }
        epsilon -= epsilonDecline;
    }
}

async function trainFinish(){
    await qtable.store();
    console.log('training finished!');
}`,
        }
    ]
}

export default TicTacToeQTable;