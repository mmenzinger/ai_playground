# Wumpus World

## Table of Contents
1. [Introduction](#introduction)
2. [Objects and Types](#objects-and-types)
    - [Direction](#direction)
    - [Action](#action)
    - [Agent](#agent)
    - [Percept](#percept)
    - [Tile](#tile)
    - [Settings](#settings)
    - [State](#state)
3. [Functions](#functions)
    - [copyState(state)](#copystatestate)
    - [createState(settings)](#createstatesettings)
    - [getTile(state, x, y)](#gettilestate-x-y)
    - [getPercepts(state, x, y)](#getperceptsstate-x-y)
    - [hasWon(state)](#haswonstate)
    - [getActions(state)](#getactionsstate)
    - [validateAction(state, action)](#validateactionstate-action)
    - [validAction(state, action)](#validactionstate-action)
    - [performAction(state, action)](#performactionstate-action)
    - [run(state, player, delay?, updateGUI?)](#runstate-player-delay-updategui)
    - [drawState(state)](#drawstatestate)


## Introduction
[Wumpus World](https://www.javatpoint.com/the-wumpus-world-in-artificial-intelligence) is a simple exploration game where the explorer has to find the treasure inside a cave without falling into a pit or getting eaten by a monster named Wumpus. The cave is generally unknown, the player only knows the tiles he has already visited und the perceptions on them. He can either perceive a breeze, when a pit is adjacent or a stench when Wumpus is adjacent.  
With this information the explorer has to manoeuver through the cave and optionally use his single arrow to kill the Wumpus, so he can pass over its tile.  
If the player has not found the treasure after 1000 moves, the game is lost.

While the game is a good example for a [knowledge-based agent](https://www.tutorialandexample.com/knowledge-based-agents-in-ai), there might not be a perfect solution. The situation can be ambiguous and the explorer might have to choose between multiple possibly risky next steps.

The game has two complexity settings Simple and Advanced. On Simple possible moves are limited to already explored tiles or unexplored tiles next to explored ones. This means the agent can jump all over the map (the assumption is he can move freely around the already explored cave). On Advanced the explorer can only move to one adjacent tile at a time.

Additionally the map size can vary and a seed can be used to get a specific map layout.

[[Top](#wumpus-world)]


## Objects and Types

### Direction
Enum for the four main directions. Mainly used inside [actions](#action) to provide a direction.
```javascript
enum EDirection {
    Up    = 0,
    Down  = 1,
    Left  = 2,
    Right = 3,
}
type Direction = number;
```
[[Top](#wumpus-world)]

### Action
Object containing the action and optionally x and y coordinates. Inside the type the direction is stored in the lower 2 bits.
```javascript
enum EAction {
    Wait       = 0,
    Shoot      = 4,
    ShootUp    = 4 | EDirection.Up,
    ShootDown  = 4 | EDirection.Down,
    ShootLeft  = 4 | EDirection.Left,
    ShootRight = 4 | EDirection.Right,
    Move       = 8,
    MoveUp     = 8 | EDirection.Up,
    MoveDown   = 8 | EDirection.Down,
    MoveLeft   = 8 | EDirection.Left,
    MoveRight  = 8 | EDirection.Right,
    MoveTo     = 8 | 16,
}
type Action = {
    type: EAction,
    x?: number,
    y?: number,
}
```
[[Top](#wumpus-world)]

### Agent
Contains all callbacks for the explorer. Only update is mandatory, the rest are optional.
```javascript
{
    init?: (state: State) => Promise<void>; // called once at the beginning
    update: (state: State, actions: Action[]) => Promise<Action>; // called every turn
    result?: (oldState: State, action: Action, newState: State, score: number) => Promise<void>; // called after each turn
    finish?: (state: State, score: number) => Promise<void>; // called once at the end
}
```
[[Top](#wumpus-world)]

### Percept
Percept is a 5-bit number containing a bit for each of the possible perceptions.
```javascript
enum EPercept {
    None    = 0,
    Bump    = 1,
    Breeze  = 2,
    Stench  = 4,
    Glitter = 8,
    Scream  = 16,
}
type Percept = number;
```
[[Top](#wumpus-world)]

### Tile
Tile is a 8-bit number containing percepts in its 5 lower bits and the tile-type in its 3 upper bits. Generally a tile can only have one type, but when all type-bits are set the tile is considered unknown.
```javascript
enum ETile {
    Empty   = 0,
    Pit     = 1,
    Wumpus  = 2,
    Gold    = 4,
    Unknown = 7,
}
type Tile = number;
```
[[Top](#wumpus-world)]

### Complexity
Complexity can be either *Simple* (the player can teleport) or *Advanced* (the player can only move to adjacent tiles).
```javascript
enum EComplexity {
    Simple:   0,
    Advanced: 1,
}
type Complexity = number;
```
[[Top](#wumpus-world)]

### Settings
Contains the settings needed to create a new [state](#state).  
```javascript
type Settings = {
    complexity: Complexity,
    size: number,
    seed: string,
}
```
[[Top](#wumpus-world)]

### State
Object containing all information to describe the current state. For a deep copy the [copystate](#copystatestate) function can be used.  
Size, complexity and seed correspond to [settings](#settings). Map is an uint8 array, each entry containing a [tile](#tile) (row-wise). In the beginning most [tiles](#tile) will be unknown, they get revealed whenever the explorer moves on a [tile](#tile).  
Position describes the player position starting in the top left corner and percepts correspond the perceptions on the current tile.  
Score starts at 0 and gets decreased for every action the player takes. Finding the gold adds 1000 score, whenever the score reaches -1000, the player has lost.  
Alive signals if the explorer is still alive and arrow tracks his number of arrows (1 in the beginning).
```javascript
type State = {
    size: number;
    complexity: number;
    seed: string;
    map: Uint8Array;
    position: { x: number, y: number };
    percepts: Percept;
    score: number;
    alive: boolean;
    arrows: number;
}
```
[[Top](#wumpus-world)]


## Functions

### copyState(state)
Returns a deep copy of the [state](#state).
```javascript
function copyState(state: State): State;
```
[[Top](#wumpus-world)]

### createState(settings)
Returns the resulting [state](#state).  
Only one map can be used at the same time since every call to createState modifies the internal real map.
```javascript
function createState(settings: Settings): State;
```
[[Top](#wumpus-world)]

### getTile(state, x, y)
Returns the [tile](#tile) with position x, y (starting in the upper left corner).  
```javascript
function getTile(state: State, x: number, y: number): Tile;
```
[[Top](#wumpus-world)]

### getPercepts(state, x, y)
Returns the [percepts](#percept) on position x, y (starting in the upper left corner).
```javascript
function getPercepts(state: State, x: number, y: number): Percept;
```
[[Top](#wumpus-world)]

### hasWon(state)
Returns true when the player has won.
```javascript
function hasWon(state: State): boolean;
```
[[Top](#wumpus-world)]

### getActions(state)
Returns a list of currently available actions.
```javascript
function getActions(state: State): Action[];
```
[[Top](#wumpus-world)]

### validateAction(state, action)
Throws an exception if the action is invalid given the state. 
```javascript
function validateAction(state: State, action: Action): void;
```
[[Top](#wumpus-world)]

### validAction(state, action)
Returns true if given the state the action is valid, false otherwise.
```javascript
function validAction(state: State, action: Action): boolean;
```
[[Top](#wumpus-world)]

### performAction(state, action)
Returns the new state as a result of the given [action](#action).
Throws an error when the [action](#action) is invalid.
```javascript
function performAction(state: State, action: Action): State;
```
[[Top](#wumpus-world)]

### run(state, player, delay?, updateGUI?)
Takes an [agent](#agent) and uses its update function to decide its [action](#action).  
Delay creates a waiting period in milliseconds after each action and updateGUI states if the state will be drawn and updated or not.  
Throws an error if any chosen [action](#action) is invalid.  
Returns a promise with the final [state](#state).
```javascript
async function run(state: State, player: Agent, delay: number = 100, updateGUI: boolean = true): Promise<State>;
```
[[Top](#wumpus-world)]

### drawState(state)
Draws the given [state](#state).  
It relies of the *utils.js* function *getImage*, all assets have to be loaded in advance (*loadImages([...])*).
```javascript
function drawState(state: State): void;
```
[[Top](#wumpus-world)]