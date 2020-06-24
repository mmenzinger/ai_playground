import { storeJson, loadJson } from 'lib/utils.js';
import * as $ from 'project/scenario.js';


//------------------------------------------------------------------------------
// pseudo-randomly shuffle an array
export function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

export class QTable {
    constructor(initialValue = 0) {
        this._data = new Map();
        this._initialValue = initialValue;
    }

    idToAction(id, player) {
        return $.createAction(player, id / 3 | 0, id % 3);
    }

    actionToId(action) {
        return (action >> 4 & 0b11) * 3 + (action >> 2 & 0b11);
    }

    getBoard(state){
        return state & 0x3ffff;
    }

    set(state, action, value) {
        const board = this.getBoard(state);
        const actionId = this.actionToId(action);
        if (this._data.has(board)) {
            this._data.get(board)[actionId] = value;
        }
        else {
            const cols = new Array(9).fill(this._initialValue);
            cols[actionId] = value;
            this._data.set(board, cols);
        }
    }

    get(state, action = undefined) {
        const board = this.getBoard(state);
        if (!this._data.has(board)) {
            if (action === undefined)
                return new Array(9).fill(this._initialValue);
            else
                return this._initialValue;
        }
        if (action === undefined) { // return full row
            return this._data.get(board);
        }
        const actionId = this.actionToId(action);
        return this._data.get(board)[actionId];
    }

    getBestValidAction(state, player = $.EPlayer.Computer, punish = 0) {
        const board = this.getBoard(state);
        const actions = this.get(board).map((x, i) => [i, x]);
        shuffle(actions);
        actions.sort((a, b) => b[1] - a[1]);

        let bestAction;
        for (let i = 0; i < actions.length; i++) {
            bestAction = this.idToAction(actions[i][0], player);
            if ($.validAction(state, bestAction))
                break;
            else if(punish){
                // invalid move, punish
                this.set(board, bestAction, punish);
            }
        }

        return bestAction;
    }

    async store(name = 'qtable') {
        debugger;
        await storeJson(name, this._data);
    }

    async load(name = 'qtable') {
        try {
            this._data = await loadJson(name);
        }
        catch (e) {
            console.warn("no file to load!");
        }
    }
}