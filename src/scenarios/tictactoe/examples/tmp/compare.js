async function compare(){
    const qtable1 = new QTable();
    const qtable2 = new QTable();
    //await qtable1.load('q:0.4,0.8,0.01,0.001');
    await qtable1.load('qbetter');
    await qtable2.load('qbackpropagate');
    
    const epochs = 5;
    const episodes = 1000;

    for(let epoch = 0; epoch < epochs; epoch++){
        let wins1 = 0;
        let wins2 = 0;
        let draws = 0;
        
        for(let episode = 0; episode < episodes; episode++){
            const scenario = createScenario({startingPlayer: episode % 2 + 1});
            
            const player1 = {
                async update(state, actions) {
                    //console.log(state);
                    return qtable1.getBestValidAction(state);
                }
            };
            const player2 = {
                async update(state, actions){
                    //console.log(state);
                    const invBoard = state.board.map(row => row.map(x => {
                       if(x === 1) return 2;
                       if(x === 2) return 1;
                       return 0;
                    }));
                    state.board = invBoard;
                    const action = qtable2.getBestValidAction(state);
                    action.player = Player.Player2;
                    return action;
                },
            };
            
            const winner = await scenario.run(player1, player2);
            //console.log(scenario.getState());
            if(winner === Player.Player1)
                wins1++;
            if(winner === Player.Player2)
                wins2++;
            if(winner === Player.Both)
                draws++;
            
        }
        console.log(`${epoch * episodes} - ${(epoch+1) * episodes}: winrate1: ${wins1 / episodes}, winrate2: ${wins2 / episodes}, draws: ${draws}`);
    }
    console.log('training finished!');
}