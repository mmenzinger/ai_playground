import * as $ from 'project/scenario.js';
import * as _ from 'lib/utils.js';

// constants for rendering
const canvas = _.getCanvas(1);
const ctx = canvas.getContext("2d");
const scale = Math.min(
    canvas.width / $.CANVAS_WIDTH / 2,
    canvas.height / $.CANVAS_HEIGHT / 2
);

/**
 * Class representing a simple Q-table for Flappy Birds.
 */
export class QTable{
    /**
     * Create a Q-table.
     * @param {number} initialValue - The value each entry has by default.
     * @param {number} minValue - The smallest possible value.
     * @param {number} maxValue - The highest possible value.
     */
    constructor(initialValue = 0, minValue = -Infinity, maxValue = Infinity) {
        this._data = new Map();
        this._initialValue = initialValue;
        this._minValue = minValue;
        this._maxValue = maxValue;
    }

    /**
     * Sets the value for the specific action given the state.
     * @param {number | string} state
     * @param {$.EAction} action
     * @param {number} value
     * @return {void}
     */
    set(state, action, value) {
        if (this._data.has(state)) {
            this._data.get(state)[action] = Math.min(
                Math.max(value, this._minValue),
                this._maxValue
            );
        }
        else {
            const cols = new Array(2).fill(this._initialValue);
            cols[action] = Math.min(
                Math.max(value, this._minValue),
                this._maxValue
            );
            this._data.set(state, cols);
        }
    }

    /**
     * Returns the value of the action given the state.
     * @param {number | string} state
     * @param {$.EAction} action
     * @return {number}
     */
    get(state, action) {
        if (!this._data.has(state)) {
             return this._initialValue;
        }
        return this._data.get(state)[action];
    }

    /**
     * Returns an array of values corresponding to all possible actions given the state.
     * @param {number | string} state
     * @return {number[]}
     */
    getAll(state) {
        if (!this._data.has(state)) {
            return new Array(2).fill(this._initialValue);
        }
        return this._data.get(state);
    }

    /**
     * Returns the action with the highest value given the state.
     * @param {number | string} state
     * @return {$.EAction}
     */
    getBestAction(state) {
        const actions = this._data.get(state);

        // if Jump has higher reward, jump
        if(actions && actions[1] > actions[0])
            return $.EAction.Jump;
        // else do nothing
        return $.EAction.Idle;
    }

    /**
     * Saves the Q-table in a json-file.
     * @param {string} name
     * @return {Promise<void>}
     */
    async store(name = 'qtable') {
        await _.storeJson(name, this._data);
    }

    /**
     * Loads the Q-table from a json-file.
     * @param {string} name
     * @return {Promise<void>}
     */
    async load(name = 'qtable') {
        try {
            this._data = await _.loadJson(name);
        }
        catch (e) {
            console.warn("no file to load!");
        }
    }

    /**
     * Renders the Q-Table.
     * @param {(obs: $.Observations) => string | number} observationsToState
     * @param {number} rows
     * @param {number} cols
     * @return {Promise<void>}
     */
    async render(observationsToState, rows = 20, cols = 15) {
        return new Promise((resolve, _) => {
            requestAnimationFrame(() => {
                console.log(scale);
                ctx.setTransform(scale, 0, 0, scale, $.CANVAS_WIDTH*scale, $.CANVAS_HEIGHT*scale);
                ctx.clearRect(0, 0, $.CANVAS_WIDTH, $.CANVAS_HEIGHT);
                const dx = $.CANVAS_WIDTH / cols;
                const dy = $.CANVAS_HEIGHT / rows;
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const obs = {
                            horizontalDistance: $.CANVAS_WIDTH - $.PIPE_WIDTH * 2 - col * dx - dx / 2,
                            verticalDistance: $.CANVAS_HEIGHT / 2 - row * dy - dy / 2,
                        };
                        const state = observationsToState(obs);
                        if (!this._data.has(state)) {
                            ctx.fillStyle = `rgba(0, 0, 0, 0.5)`;
                        }
                        else {
                            const values = this.getAll(state);
                            ctx.fillStyle = `rgba(${
                                values[1] > values[0]
                                    ? 100 + ~~Math.max(values[0] / this._maxValue * 155, 0)
                                    : 0
                            },0,${
                                values[0] >= values[1]
                                    ? 100 + ~~Math.max(values[1] / this._maxValue * 155, 0)
                                    : 0
                            },0.9)`;
                        }
                        ctx.fillRect(dx * col, dy * row, dx, dy);
                    }
                }
                ctx.fillStyle = `rgba(255,255,255,0.8)`;
                ctx.fillRect(
                    $.CANVAS_WIDTH - $.PIPE_WIDTH * 2.5 + dx/2,
                    0,
                    $.PIPE_WIDTH,
                    $.CANVAS_HEIGHT / 2 - $.PIPE_SPACE / 2
                );
                ctx.fillRect(
                    $.CANVAS_WIDTH - $.PIPE_WIDTH * 2.5 + dx/2,
                    $.CANVAS_HEIGHT / 2 + $.PIPE_SPACE / 2,
                    $.PIPE_WIDTH,
                    $.CANVAS_HEIGHT / 2 - $.PIPE_SPACE / 2
                );
                resolve();
            });
        });
    }
}