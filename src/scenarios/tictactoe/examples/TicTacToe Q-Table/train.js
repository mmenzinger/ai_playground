import { QTable } from '/project/qtable.js';

export async function generateQTable(){
    const qtable = new QTable();
    
    const alpha = 0.4; // learning rate
    const gamma = 0.8; // discount factor
    const epochs = 10;
    const episodes = 10000;
    const epsilonStart = 1.0;
    const epsilonMin = 0.01;
    const epsilonDecline = 0.00015;

    for(let epoch = 0; epoch < epochs; epoch++){
        console.log(`training episodes ${epoch * episodes} - ${(epoch+1) * episodes}`);
        let wins = 0;
        let losses = 0;
        
        let epsilon = epsilonStart;
        for(let episode = 0; episode < episodes; episode++){
            const scenario = S.createScenario({
                startingPlayer: episode % 2 + 1
            });
            const memoryPlayer1 = [];
            const memoryPlayer2 = [];
            
            const player1 = {
                async update(state, actions) {
                    if(Math.random() < epsilon){ // explore
                        let actionId = Math.round(Math.random()*(actions.length-1));
                        return actions[actionId];
                    }
                    else{ // use qtable to get best move
                        return qtable.getBestValidAction(state);
                    }
                },
                async result(oldState, action, newState, reward){
                    memoryPlayer1.unshift({action:action, state:oldState});
                }
            };
            
            const player2 = {
                async update(state, actions){
                    let actionId = Math.round(Math.random()*(actions.length-1));
                    return actions[actionId];
                },
                async result(oldState, action, newState, reward){
                    memoryPlayer2.unshift({action:action, state:oldState});
                }
            };
            
            const winner = await scenario.run(player1, player2);
            if(winner === S.Player.Player1)
                wins++;
            if(winner === S.Player.Player2)
                losses++;

            const score = scenario.getScore(S.Player.Player1);
            let lastMemory = memoryPlayer1.shift();
            qtable.set(lastMemory.state, lastMemory.action, score);
            memoryPlayer1.forEach(memory => {
                const oldScore = qtable.get(memory.state, memory.action);
                const bestNewScore = Math.max(...qtable.get(lastMemory.state));
                const newScore = (1-alpha)*oldScore + alpha*gamma*bestNewScore;
                qtable.set(memory.state, memory.action, newScore);
            });
            
            epsilon = Math.max(epsilonMin, epsilon-epsilonDecline);
        }
        console.log(`winrate: ${wins / episodes}, lossrate: ${losses / episodes}`);
    }
    
    await qtable.store('qtable');
    console.log('training finished!');
}