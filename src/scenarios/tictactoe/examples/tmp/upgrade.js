async function upgrade(filename){
    const qtable = new QTable();
    const qenemy = new QTable();
    qtable.load(filename);
    qenemy.load(filename);
    
    
    const alpha = 0.4; // learning rate
    const gamma = 0.8; // discount factor
    const epochs = 10;
    const episodes = 10000;
    const epsilonStart = 1.0;
    const epsilonMin = 0.01;
    const epsilonDecline = 0.01;

    for(let epoch = 0; epoch < epochs; epoch++){
        console.log(`training episodes ${epoch * episodes} - ${(epoch+1) * episodes}`);
        let wins = 0;
        let losses = 0;
        
        let epsilon = epsilonStart;
        for(let episode = 0; episode < episodes; episode++){
            const scenario = createScenario({startingPlayer: episode % 2 + 1});
            let lastAction;
            let lastState;
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
                    lastAction = action;
                    lastState = oldState;
                    const oldScore = qtable.get(oldState, action);
                    const bestNewScore = Math.max(...qtable.get(newState));
                    //const newScore = (1-alpha)*oldScore + alpha*reward ;
                    const newScore = (1-alpha)*oldScore + alpha*(reward + gamma*bestNewScore);
                    qtable.set(oldState, action, newScore);
                }
            };
            
            const player2 = {
                async update(state, actions){
                    const invBoard = state.board.map(row => row.map(x => {
                       if(x === 1) return 2;
                       if(x === 2) return 1;
                       return 0;
                    }));
                    state.board = invBoard;
                    const action = qenemy.getBestValidAction(state);
                    action.player = Player.Player2;
                    return action;
                },
                async result(oldState, action, newState, reward){
                    if(reward === 1){ // enemy has won
                        qtable.set(lastState, lastAction, -1);
                    }
                    
                }
            };
            
            const winner = await scenario.run(player1, player2);
            if(winner === Player.Player1)
                wins++;
            if(winner === Player.Player2)
                losses++;
            
            epsilon = Math.max(epsilonMin, epsilon-epsilonDecline);
        }
        console.log(`winrate: ${wins / episodes}, lossrate: ${losses / episodes}`);
    }
    
    await qtable.store('qbetter2');
    console.log('training finished!');
}