# TicTacToe

## Table of Contents
1. [Introduction](#introduction)
2. [Objects and Types](#objects-and-types)
    - [Action](#action)
    - [Agent](#agent)
    - [Player](#player)
    - [Settings](#settings)
    - [State](#state)
3. [Functions](#functions)
    - [createAction(player, row, col)](#createactionplayer-row-col)
    - [createState(player, board?)](#createstateplayer-board)
    - [actionToObject(action)](#actiontoobjectaction)
    - [stateToObject(state)](#statetoobjectstate)
    - [getPlayer(state)](#getplayerstate)
    - [getBoard(state)](#getboardstate)
    - [getScore(state, player)](#getscorestate-player)
    - [getWinner(state)](#getwinnerstate)
    - [validateAction(state, action)](#validateactionstate-action)
    - [validAction(state, action)](#validactionstate-action)
    - [performAction(state, action)](#performactionstate-action)
    - [run(state, agent1, agent2?)](#runstate-agent1-agent2)
    - [drawState(state, hover?)](#drawstatestate-hover)


## Introduction
[Tic-Tac-Toe](https://en.wikipedia.org/wiki/Tic-tac-toe) is a two player game played on a 3 by 3 board. In alternating turns the players put their token (represented by X and O) on the board. The first player who has 3 of his tokens in a row (horizontally, vertically or diagonally) wins.

The complexity of the game is quite low, when both players play perfectly neither can win. An unbeatable AI can easily be created using an [min-max](https://en.wikipedia.org/wiki/Minimax) approach. Since the number of possible states is also fairly low a simple [Q-learning](https://en.wikipedia.org/wiki/Q-learning) algorithm (with a complete Q-table) can also be used.

[[Top](#tictactoe)]


## Objects and Types

### Action
Contains a position and the current [player](#player).  
Action is a 6-bit number containing the row in the 2 upper bits, col in the 2 middle bits and the [player](#player) in the 2 lower bits.  
Can be created using the [createAction](#createactionplayer-row-col) function.
```javascript
type Action: number;
```
[[Top](#tictactoe)]

### Agent
Contains all callbacks for a [player](#player). Only update is mandatory, the rest are optional.
```javascript
{
    init?: (state: State) => Promise<void>; // called once at the beginning
    update: (state: State, actions: Action[]) => Promise<Action>; // called every turn
    result?: (oldState: State, action: Action, newState: State, score: number) => Promise<void>; // called after each turn
    finish?: (state: State, score: number) => Promise<void>; // called once at the end
}
```
[[Top](#tictactoe)]

### Player
Player is a 2-bit number containing a bit for each of the players.  
The enum EPlayer provides easily readable defaults.
```javascript
enum EPlayer {
    None     = 0,
    Computer = 1,
    Human    = 2,
    Both     = Computer | Human,
    Player1  = Computer,
    Player2  = Human,
}
type Player: number;
```
[[Top](#tictactoe)]

### Settings
Contains the settings needed to create a new [state](#state).
```javascript
{
    startingPlayer: Player;
}
```
[[Top](#tictactoe)]

### State
Contains the board and the active as well as the starting [player](#player).  
The state is a 20-bit number, containing the current [player](#player) in its two highest bits and the nine fields from top/left to bottom/right in the 18 rightmost bits.  
The functions getPlayer and getBoard can be used to easily get the current [player](#player) or board.  
Since it is a trivial datatype assignment always results in a copy of the state.
```javascript
type State: number;
```
[[Top](#tictactoe)]


## Functions

### createAction(player, row, col)
Returns the resulting [action](#action).
```javascript
function createAction(player: Player, row: number, col: number): Action;
```
[[Top](#tictactoe)]

### createState(player, board?)
Returns the resulting [state](#state).  
Board is an optional 2-dimensional array of [players](#player).
```javascript
function createState(player: Player, board?: Player[][]): State;
```
[[Top](#tictactoe)]

### actionToObject(action)
Returns the action in a more readable object form. Mainly for debugging purposes.
```javascript
function actionToObject(action: Action): {
    player: Player,
    row: number,
    col: number,
};
```
[[Top](#tictactoe)]

### stateToObject(state)
Returns the state in a more readable object form. Mainly for debugging purposes.
```javascript
function stateToObject(state: State): {
    board: Player[][],
    player: Player,
};
```
[[Top](#tictactoe)]

### getPlayer(state)
Returns the current [player](#player). 
```javascript
function getPlayer(state: State): Player;
```
[[Top](#tictactoe)]

### getBoard(state)
Returns the current board in form of an 2-dimension [player](#player) array. 
```javascript
function getBoard(state: State): Player[][];
```
[[Top](#tictactoe)]

### getScore(state, player)
Returns the score for the given [player](#player) (1 = won, -1 = lost, 0 = draw or still going).
```javascript
function getScore(state: State, player: Player): number;
```
[[Top](#tictactoe)]

### getWinner(state)
Returns the winning [player](#player).  
Returns Player.None if the game is still going and Player.Both in case of a draw.  
```javascript
function getWinner(state: State): Player;
```
[[Top](#tictactoe)]

### validateAction(state, action)
Throws an exception if it is not a valid action given the state. 
```javascript
function validateAction(state: State, action: Action): void;
```
[[Top](#tictactoe)]

### validAction(state, action)
Returns true if given the state the action is valid, false otherwise.
```javascript
function validAction(state: State, action: Action): boolean;
```
[[Top](#tictactoe)]

### performAction(state, action)
Returns the new state as a result of the given [action](#action).  
Throws an error when the [action](#action) is invalid.
```javascript
function performAction(state: State, action: Action): State;
```
[[Top](#tictactoe)]

### run(state, agent1, agent2?)
Takes two [agents](#agent) and uses their update function to decide their [actions](#action).  
When agent2 is not provided the user acts as agent2.  
The init, result and finish functions are optional.  
Throws an error if any chosen [action](#action) is invalid.  
Returns a promise with the final [state](#state).
```javascript
async function run(state: State, agent1: Agent, agent2?: Agent): Promise<State>;
```
[[Top](#tictactoe)]

drawState(state, hover = undefined)
### drawState(state, hover?)
Draws the given [state](#state).  
When hover is provided, the corresponding tile will be highlighted.
```javascript
function drawState(state: State, hover?: {row: number, col: number}): void;
```
[[Top](#tictactoe)]