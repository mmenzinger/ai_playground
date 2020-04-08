import { messageWithResult, deepCopy } from 'src/util.js';
import merge from 'lodash/merge.js';

export const Player = Object.freeze({
    None: 0,
    Computer: 1,
    Human: 2,
    Both: 3,
    Player1: 1,
    Player2: 2,
});

export function createScenario(initState) {
    const state = {
        settings: {
            startingPlayer: 1,
        },
        board: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        player: 1,
    };
    merge(state, initState);
    state.player = state.settings.startingPlayer;

    return Object.freeze({
        clone() { return createScenario(deepCopy(state)); },
        getState() { return deepCopy(state); },

        getScore(player) {
            const winner = this.getWinner(state);
            if (winner === player)
                return 1;
            if (winner === Player.Both || winner == Player.None)
                return 0;
            return -1;
        },

        getWinner() {
            const board = state.board;
            // check rows
            for (let i = 0; i < 3; i++)
                if (board[i].every(p => (p === board[i][0] && p !== Player.None))) return board[i][0];
            // check cols
            for (let i = 0; i < 3; i++)
                if (board.every(row => (row[i] === board[0][i] && row[i] !== Player.None))) return board[0][i];
            // check diagonals
            if (board[1][1] !== Player.None) {
                if (board[1][1] === board[0][0] && board[1][1] === board[2][2]) return board[1][1];
                if (board[1][1] === board[2][0] && board[1][1] === board[0][2]) return board[1][1];
            }

            // check draw
            if (!board.flat().includes(Player.None))
                return Player.Both;

            return Player.None;
        },
        getActions() {
            const actions = [];
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (state.board[row][col] === Player.None)
                        actions.push({ type: 'PLACE', row, col, player: state.player });
                }
            }
            return actions;
        },
        validateAction(action) {
            if (action.type !== 'PLACE') throw Error(`unknown action type '${action.type}'`);
            if (action.row < 0 || action.row > 2) throw Error(`row index must be between 0 and 2 (was ${action.row})`);
            if (action.col < 0 || action.col > 2) throw Error(`col index must be between 0 and 2 (was ${action.col})`);
            if (state.board[action.row][action.col] !== Player.None) throw Error(`position (${action.row}, ${action.col}) not empty`);
            if (action.player !== state.player) throw Error(`invalid player ${action.player}`);
        },
        validAction(action) {
            try {
                this.validateAction(action);
                return true;
            }
            catch (e) {
                return false;
            }
        },
        performAction(action) {
            this.validateAction(action);
            state.board[action.row][action.col] = action.player;
            const winner = this.getWinner();
            if (winner === Player.None) {
                state.player = state.player % 2 + 1;
            }
            return winner;
        },

        async run(player1, player2 = {
            init: (state) => messageWithResult({ type: 'call', functionName: 'onInit', args: [state] }),
            update: (state, actions) => messageWithResult({ type: 'call', functionName: 'onUpdate', args: [state, actions] }),
            finish: (state, score) => messageWithResult({ type: 'call', functionName: 'onFinish', args: [state, score] }),
        }) {
            const players = [player1, player2];
            if (player1.init instanceof Function)
                await player1.init(this.getState());
            if (player2.init instanceof Function)
                await player2.init(this.getState());

            let winner = Player.None;
            while (winner === Player.None) {
                const currentPlayer = players[state.player - 1];
                const oldState = this.getState();
                const actions = this.getActions();
                const action = await currentPlayer.update(oldState, actions);
                winner = this.performAction(action);
                if (currentPlayer.result instanceof Function)
                    await currentPlayer.result(oldState, action, this.getState(), this.getScore(state.player));
            }
            state.player = winner;
            if (player1.finish instanceof Function) {
                const score1 = this.getScore(Player.Player1);
                const state = this.getState();
                await player1.finish(state, score1);
            }
            if (player2.finish instanceof Function) {
                const score2 = this.getScore(Player.Player2);
                const state = this.getState();
                await player2.finish(state, score2);
            }
            return winner;
        }
    });
}

export async function __run(state) {
    const scenario = createScenario(state);
    const player1 = await import(/* webpackIgnore: true */'/project/index.js');
    return await scenario.run(player1);
}