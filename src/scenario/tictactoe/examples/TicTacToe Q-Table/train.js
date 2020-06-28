import { QTable } from 'project/qtable.js';
import * as $ from 'project/scenario.js';

//------------------------------------------------------------------------------
export async function generateQTable() {
    const qtable = new QTable(0);

    const alpha = 0.9; // learning rate
    const gamma = 0.95; // discount factor
    const epochs = 10;
    const episodes = 20000;
    const epsilonStart = 1.0;
    const epsilonMin = 0.00;
    const epsilonDecline = 0.00001;

    for (let epoch = 0; epoch < epochs; epoch++) {
        console.log(`training episodes ${epoch * episodes} - ${(epoch + 1) * episodes}`);
        let wins = 0;
        let losses = 0;
        let draws = 0;

        // decline exploration rate starting value with each epoch, down to 0
        let epsilon = epsilonStart * ((epochs - epoch - 1) / (epochs - 1));
        for (let episode = 0; episode < episodes; episode++) {
            const memoryPlayer = [];

            const player1 = {
                async update(state, actions) {
                    if (Math.random() < epsilon) { // explore
                        let actionId = Math.round(Math.random() * (actions.length - 1));
                        return actions[actionId];
                    }
                    else { // use qtable to get best move, punish on invalid move attempts
                        return qtable.getBestValidAction(state, $.EPlayer.Player1, -1);
                    }
                },
                async result(oldState, action, newState, reward) {
                    // store state before action and the action itself for later q-value updates
                    memoryPlayer.unshift({ action: action, state: oldState });
                }
            };

            const player2 = {
                async update(state, actions) {
                    const action = Math.round(Math.random()*(actions.length-1));
                    return actions[action];
                }
            };

            const settings = {
                startingPlayer: episode % 2 + 1, // switch between first and second player
            };
            let state = $.createState(settings);
            state = await $.run(state, player1, player2, false);

            const winner = $.getWinner(state);
            switch(winner){
                case $.EPlayer.Player1: wins++; break;
                case $.EPlayer.Player2: losses++; break;
                case $.EPlayer.Both: draws++; break;
            }

            let score = $.getScore(state, $.EPlayer.Player1);
            let lastMemory = memoryPlayer.shift();
            // rate last action based on the final result
            qtable.set(lastMemory.state, lastMemory.action, score);
            memoryPlayer.forEach(memory => {
                // update ratings for all actions
                const oldScore = qtable.get(memory.state, memory.action);
                const bestNewScore = Math.max(...qtable.get(lastMemory.state));
                const newScore = (1 - alpha) * oldScore + alpha * gamma * bestNewScore;
                qtable.set(memory.state, memory.action, newScore);
                lastMemory = memory;
            });
            // decrease exploration rate
            epsilon = Math.max(epsilonMin, epsilon - epsilonDecline);
        }
        console.log(`winrate: ${wins / episodes}, lossrate: ${losses / episodes}, drawrate: ${draws / episodes}`);
    }

    await qtable.store('qtable');
    console.log('training finished!');
}
