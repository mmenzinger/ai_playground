Player = {
    None: 0,
    Computer: 1,
    Human: 2,
    Both: 3,
};

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getScore(state, player = Player.Computer) {
    const winner = getWinner(state);
    if(winner === player)
        return 1;
    if(winner === Player.Both || winner == Player.None)
        return 0;
    return -1;
}

function getWinner(state) {
    const board = state.board;
    // check rows
    for (let i = 0; i < 3; i++)
        if (board[i].every(p => (p === board[i][0] && p !== Player.None))) return board[i][0];
    // check cols
    for (let i = 0; i < 3; i++)
        if (board.every(row => (row[i] === board[0][i] && row[i] !== Player.None))) return board[0][i];
    // check diagonals
    if(board[1][1] !== Player.None){
        if (board[1][1] === board[0][0] && board[1][1] === board[2][2]) return board[1][1];
        if (board[1][1] === board[2][0] && board[1][1] === board[0][2]) return board[1][1];
    }

    // check draw
    if(!board.flat().includes(Player.None))
        return Player.Both;

    return Player.None;
}

function getActions(state) {
    const actions = [];
    for(let row = 0; row < 3; row++){
        for(let col = 0; col < 3; col++){
            if(state.board[row][col] === Player.None)
                actions.push({type: 'PLACE', row, col, player: state.player});
        }
    }
    return actions;
}

function validateAction(state, action) {
    if (action.type !== 'PLACE') throw Error(`unknown action type '${action.type}'`);
    if (action.row < 0 || action.row > 2) throw Error(`row index must be between 0 and 2 (was ${action.row})`);
    if (action.col < 0 || action.col > 2) throw Error(`col index must be between 0 and 2 (was ${action.col})`);
    if (state.board[action.row][action.col] !== Player.None) throw Error(`position (${action.row}, ${action.col}) not empty`);
    if (action.player !== state.player) throw Error(`invalid player ${action.player}`);
}

function performAction(state, action) {
    validateAction(state, action);
    const newState = deepCopy(state);
    newState.board[action.row][action.col] = action.player;
    if(getWinner(newState) === Player.None){
        newState.player = state.player === Player.Computer ? Player.Human : Player.Computer;
    }
    return newState;
}


// evil global export... waiting for es6 modules in web-workers...
self.scenario = {
    Player,
    getScore,
    getWinner,
    getActions,
    validateAction,
    performAction,
}