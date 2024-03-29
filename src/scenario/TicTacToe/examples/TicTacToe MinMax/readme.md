# TicTacToe - MinMax

This is an exemplary implementation of a minmax algorithm. The solution is loosely based on the article [Tic Tac Toe - Creating Unbeatable AI](https://towardsdatascience.com/tic-tac-toe-creating-unbeatable-ai-with-minimax-algorithm-8af9e52c1e7d) which provides a good introduction into a minmax-based ai.

## Hints

Working with exhaustive search algorithms often means to calculate thousands of game states, which can be quite demanding. It is highly recommended not to use slow functions like console.log() inside such hot loops/functions.

For development purposes it can be useful to start with a reduced state by manually setting the initial state, so that at least one or two turns have already passed:
```javascript
const state = createState(
    Player.Computer,
    [
        [1,2,1],
        [0,2,0],
        [0,0,0],
    ]
);
```
This reduces the amount of work dramatically, so that debugging statements can be used again.