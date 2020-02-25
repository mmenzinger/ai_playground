# TicTacToe

## Table of Contents
1. [Globals](#globals)
    - [Player](#player)
2. [Functions](#functions)
    - [createScenario(settings)](#createscenariosettings)
    - [scenario.getState()](#scenariogetstate)
    - [scenario.getScore(player)](#scenariogetscoreplayer)
    - [scenario.getWinner()](#scenariogetwinner)
    - [scenario.getActions()](#scenariogetactions)
    - [scenario.validateAction(action)](#scenariovalidateactionaction)
    - [scenario.validAction(action)](#scenariovalidactionaction)
    - [scenario.performAction(action)](#scenarioperformactionaction)
    - [scenario.run(player1, player2)](#scenariorunplayer1player2)

## Globals

### Player
```javascript
const Player = {
    None: 0,
    Computer: 1,
    Human: 2,
    Both: 3,
    Player1: 1,
    Player2: 2,
};
```
[[Top](#tictactoe)]

## Functions

### createScenario(settings)
returns a new scenario object based on the given settings.
```javascript
function createScenario(settings = {
    startingPlayer: Player.Human
}) {
    return scenario; // ScenarioObject
}
```
[[Top](#tictactoe)]

### scenario.getState()
returns a state object, containing the board and the active player.
The board is a 2d-array containing Players (0 == Player.None).
```javascript
const StateObject = {
    board: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], // board of Players
    player: Player.Player1,
};

function getState() {
    return StateObject;
}
```
[[Top](#tictactoe)]

### scenario.getScore(player)
returns the current score for the given player (1 = won, -1 = lost, 0 = draw).
```javascript
function getScore(player = Player.Player1) {
    return 1; // number
}
```
[[Top](#tictactoe)]

### scenario.getWinner()
returns the current winner, can be Player.None, Player.Player1/2 or Player.Both.
```javascript
function getWinner() {
    return Player.None; // player
}
```
[[Top](#tictactoe)]

### scenario.getActions()
returns a list of available actions for the current player. Each action contains
a position (row and col starting with 0,0 at the left upper corner), a type 
(always PLACE) and the current player.
```javascript
const ActionObject = { 
    type: 'PLACE', 
    row: 0, 
    col: 0, 
    player: Player.Player2
};

function getActions() { 
    return [ // list of actions
        ActionObject,
        ActionObject,
        ...
    ];
}
```
[[Top](#tictactoe)]

### scenario.validateAction(action)
validates the given action in relation to the current state.  
throws an error when there is something wrong.
```javascript
function validateAction(action = ActionObject) { 
    throw Error('error message');
}
```
[[Top](#tictactoe)]

### scenario.validAction(action)
validates the given action in relation to the current state.  
returns either true or false.
```javascript
function validAction(action = ActionObject) {
    return true; // boolean
}
```
[[Top](#tictactoe)]

### scenario.performAction(action)
updates the current state by applying the given action.  
returns the winner after the effect of the action (Player.None, Player.Player1/2 or Player.Both).  
throws an error when the action is not valid.
```javascript
function performAction(action = ActionObject) {
    return Player.None; // winner
}
```
[[Top](#tictactoe)]

### scenario.run(player1, player2)
takes two player objects and uses their update function to decide their actions.
The init, result and finish functions are optional. They can for example be used
to train a reinforced learning AI.  
throws an error if any chosen action is invalid.
returns the winning player (Player.None, Player.Player1/2 or Player.Both).
```javascript
const PlayerObject = {
    init: async function(state){}, // optional
    update: async function(state, actions){}, // REQUIRED!
    result: async function(oldState, action, newState, score){}, // optional
    finish: async function(state, score){} // optional
};

async function run(player1 = PlayerObject, player2 = PlayerObject){
    return Player.Both; // winner
}
```
[[Top](#tictactoe)]