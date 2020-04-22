# TicTacToe

## Table of Contents
1. [Introduction](#introduction)
2. [Callbacks](#callbacks)
    - [init(state)](#initstate)
    - [update(state, actions)](#updatestate-actions)
    - [result(oldState, action, newState, score)](#resultoldstate-action-newstate-score)
    - [finish(state, score)](#finishstate-score)
3. [Globals](#globals)
    - [Player](#player)
4. [Objects](#objects)
    - [Action](#action)
    - [Agent](#agent)
    - [Scenario](#scenario)
    - [State](#state)
5. [Functions](#functions)
    - [createScenario(state)](#createscenariostate)
    - [Scenario.clone()](#scenarioclone)
    - [Scenario.getActions()](#scenariogetactions)
    - [Scenario.getScore(player)](#scenariogetscoreplayer)
    - [Scenario.getState()](#scenariogetstate)
    - [Scenario.getWinner()](#scenariogetwinner)
    - [Scenario.performAction(action)](#scenarioperformactionaction)
    - [Scenario.run(player1, player2)](#scenariorunplayer1-player2)
    - [Scenario.validAction(action)](#scenariovalidactionaction)
    - [Scenario.validateAction(action)](#scenariovalidateactionaction)


## Introduction
[Tic-Tac-Toe](https://en.wikipedia.org/wiki/Tic-tac-toe) is a two player game played on a 3 by 3 board. In alternating turns the players put their token (represented by X and O) on the board. The first player who has 3 of his tokens in a row (horizontally, vertically or diagonally) wins.

The complexity of the game is quite low, when both players play perfectly neither can win. An unbeatable AI can easily be created using an [min-max](https://en.wikipedia.org/wiki/Minimax) approach. Since the number of different states is also fairly low a simple [Q-learning](https://en.wikipedia.org/wiki/Q-learning) algorithm (with a complete Q-table) can also be used.

[[Top](#tictactoe)]


## Callbacks

All callbacks are [asynchronous](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) functions which have to be [exported](https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export) in the index.js file.  
The callback **[update](#updatestate-actions) is mandatory**, all other callbacks are optional.

### init(state)
Called once at the beginning of the game. State is the starting [state](#scenariogetstate).
```javascript
export async function init(state){
    ...
}
```
[[Top](#tictactoe)]

### update(state, actions)
Called every time at the beginning of the computers turn. State is the current state [state](#scenariogetstate) and actions is a list of available [actions](#scenariogetactions).  
Returns the chosen action.
```javascript
export async function update(state, actions){
    ...
    return action;
}
```
[[Top](#tictactoe)]

### result(oldState, action, newState, score)
Called every time at the end of the computers turn. OldState and newState are the [states](#scenariogetstate) before and after the action. Action is the used [action](#scenariogetactions) and score is the resulting [score](#scenariogetscoreplayer).  
This callback is mainly used to evaluate the action and train some kind of reinforced learning algorithm.
```javascript
export function result(oldState, action, newState, score){
    ...
}
```
[[Top](#tictactoe)]

### finish(state, score)
Called once when the game has concluded. State is the final [state](#scenariogetstate) and score is the final [score](#scenariogetscoreplayer).  
```javascript
export async function finish(state, score){
    ...
}
```
[[Top](#tictactoe)]


## Globals

### Player
By default Player1 equals Computer and Player2 equals Human.
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


## Objects

### Action
Contains a position (row and column starting with 0,0 at the upper left corner), a type (always 'PLACE') and the current [player](#player).
```javascript
{ 
    type: 'PLACE',
    row: Number([0-2]),
    col: Number([0-2]),
    player: Player,
}
```
[[Top](#tictactoe)]

### Agent
Contains all [callbacks](#callbacks) for a [player](#player).
```javascript
{
    async init(state){}, // optional
    async update(state, actions){}, // REQUIRED!
    async result(oldState, action, newState, score){}, // optional
    async finish(state, score){}, // optional
}
```
[[Top](#tictactoe)]

### Scenario
Contains the [state](#state) and all available [functions](#functions).
```javascript
{
    getState() {},
    getScore(player) {},
    getWinner() {},
    getActions() {},
    validateAction(action) {},
    validAction(action) {},
    performAction(action) {},
    async run(agent1, agent1) {},
}
```
[[Top](#tictactoe)]

### State
Contains the board and the active as well as the starting [player](#player).
The board is a row-major 2d-array containing players (0 == Player.None).
```javascript
{
    settings: {
        startingPlayer: Player,
    },
    board: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], // board of Players
    player: Player,
}
```
[[Top](#tictactoe)]


## Functions

### createScenario(state)
Returns a new [scenario](#scenario) object based on the given [state](#state).
Unset fields will be automatically initialized with default values.
```javascript
function createScenario(state) {
    return Scenario;
}
```
[[Top](#tictactoe)]

### Scenario.clone()
Returns a clone of the current [scenario](#scenario) object.
```javascript
function clone() {
    return Scenario;
}
```
[[Top](#tictactoe)]

### Scenario.getActions()
Returns a list of available [actions](#action) for the current [player](#player). 
```javascript
function getActions() { 
    return [ // list of actions
        Action,
        Action,
        ...
    ];
}
```
[[Top](#tictactoe)]

### Scenario.getScore(player)
Returns the current score for the given [player](#player) (1 = won, -1 = lost, 0 = draw).
```javascript
function getScore(player) {
    return Number;
}
```
[[Top](#tictactoe)]

### Scenario.getState()
Returns the current [state](#state), 
```javascript

function getState() {
    return State;
}
```
[[Top](#tictactoe)]

### Scenario.getWinner()
Returns the winning [player](#player).
```javascript
function getWinner() {
    return Player;
}
```
[[Top](#tictactoe)]

### Scenario.performAction(action)
Updates the current [state](#state) by applying the given [action](#action).  
Returns the winning [player](#player) after the effect of the [action](#action).  
Throws an error when the [action](#action) is not valid.
```javascript
function performAction(action) {
    return Player; // winner
}
```
[[Top](#tictactoe)]

### Scenario.run(agent1, agent2)
Takes two [agents](#agent) and uses their update function to decide their [actions](#action).
The init, result and finish functions are optional.
Throws an error if any chosen [action](#action) is invalid.
Returns the winning [player](#player).
```javascript
async function run(agent1, agent2){
    return Player; // winner
}
```
[[Top](#tictactoe)]

### Scenario.validAction(action)
Validates the given [action](#action) in relation to the current [state](#state).  
Returns either true or false.
```javascript
function validAction(action) {
    return Boolean;
}
```
[[Top](#tictactoe)]

### Scenario.validateAction(action)
Validates the given [action](#action) in relation to the current [state](#state).  
Throws an error when there is something wrong.
```javascript
function validateAction(action) { 
    throw Error('error message');
}
```
[[Top](#tictactoe)]