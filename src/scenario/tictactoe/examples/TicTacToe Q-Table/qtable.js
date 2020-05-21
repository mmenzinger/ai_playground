import { 
    validAction, createAction, Player,
} from 'http:/scenario/tictactoe/scenario.js';

import { storeJson, loadJson } from 'http:/scenario/util.js';


//------------------------------------------------------------------------------
// pseudo-randomly shuffle an array
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

export class QTable{
    constructor(initialValue = 0){
        this._data = new Map();
        this._initialValue = initialValue;
    }
    
    idToAction(id){
        return createAction(Player.Computer, id/3|0, id%3);
    }
    
    actionToId(action){
        return (action >> 4 & 0b11)*3 + (action >> 2 & 0b11);
    }
    
    set(state, action, value){
        const actionId = this.actionToId(action);
        if(this._data.has(state)){
            this._data.get(state)[actionId] = value;
        }
        else{
            const cols = new Array(9).fill(this._initialValue);
            cols[actionId] = value;
            this._data.set(state, cols);
        }
    }
    
    get(state, action = undefined){
        if(!this._data.has(state)){
            if(action === undefined)
                return new Array(9).fill(this._initialValue);
            else
                return this._initialValue;
        }
        if(action === undefined){ // return full row
            return this._data.get(state);
        }
        const actionId = this.actionToId(action);
        return this._data.get(state)[actionId];
    }
    
    getBestValidAction(state){
        const actions = this.get(state).map((x,i) => [i, x]);
        shuffle(actions);
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
}