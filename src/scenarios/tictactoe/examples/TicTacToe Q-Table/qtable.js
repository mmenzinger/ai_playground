import { Player } from '/scenarios/tictactoe/scenario.js';

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export class QTable{
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
    
    getBestValidAction(scenario){
        const state = scenario.getState();
        const actions = this.get(state).map((x,i) => [i, x]);
        shuffle(actions);
        actions.sort((a,b) => b[1] - a[1]);
    
        let bestAction;
        for(let i = 0; i < actions.length; i++){
            bestAction = this.idToAction(actions[i][0]);
            if(scenario.validAction(bestAction))
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
}