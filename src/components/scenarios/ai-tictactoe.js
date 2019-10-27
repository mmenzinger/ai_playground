import { html, unsafeCSS } from 'lit-element';
import { LazyElement } from 'components/lazy-element.js';

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./ai-tictactoe.css').toString());

const Player = {
    None: 0,
    Computer: 1,
    Human: 2,
    Both: 3,
}

class AiTicTacToe extends LazyElement {
    static get properties() {
        return {
            _board: { type: Array },
            _playerWon: { type: Number },
            _currentTurn: { type: Number },
        };
    }

    static get styles() {
        return [
            sharedStyles,
            style
        ];
    }

    constructor() {
        super();
        this._board = [];
        this._updateCallback = () => {};
        this._finishCallback = () => {};
        this._currentTurn = Player.None;
        this._playerWon = Player.None;
    }

    get state() {
        return { 
            board: deepCopy(this._board),
            player: this._currentTurn,
        };
    }

    get actions() {
        const actions = [];
        for(let row = 0; row < 3; row++){
            for(let col = 0; col < 3; col++){
                if(this._board[row][col] === Player.None)
                    actions.push({type: 'PLACE', row, col});
            }
        }
        return actions;
    }

    render() {
        const rows = [];
        let rowId = 0;
        this._board.forEach(row => {
            const cols = [];
            let colId = 0;
            row.forEach(col => {
                if (col === 0)
                    cols.push(html`<td class="symbol${col}" @click=${this.onClick} data-row=${rowId} data-col=${colId}></td>`);
                else
                    cols.push(html`<td class="symbol${col}"></td>`);
                colId++;
            });
            rows.push(html`<tr>${cols}</tr>`)
            rowId++;
        });
        let winner = html``;
        switch(this._playerWon){
            case Player.Human:
                winner = html`<p>You have won!</p>`;
                break;
            case Player.Computer:
                winner = html`<p>You have lost!</p>`;
                break;
            case Player.Both:
                winner = html`<p>Draw!</p>`;
                break;
        }
        return html`
            <h1>Tic-Tac-Toe</h1>
            <table>${rows}</table>
            ${winner}
        `;
    }

    onClick(event) {
        if (this._currentTurn === Player.Human && this._playerWon === Player.None) {
            try {
                const row = Number(event.target.dataset.row);
                const col = Number(event.target.dataset.col);
                const action = { type: 'PLACE', player: Player.Human, row, col };
                this.validateAction(action);
                this.performAction(action);
                if(this.checkFinish()){
                    this.returnScore();
                }
                else{
                    this.nextTurn();
                    this._updateCallback(this.state, this.actions).then(action => {
                        this.onUpdate(action);
                    });
                }
                //this.requestUpdate();
            }
            catch (error) {
                console.warn('invalid move: ', error.message);
            }
        }
        else {
            if(this._playerWon === Player.None)
                console.log("its the computers turn, give him some time...");
        }
    }

    onInit(updateCallback, finishCallback) {
        this._board = [
            [Player.None, Player.None, Player.None],
            [Player.None, Player.None, Player.None],
            [Player.None, Player.None, Player.None],
        ];
        this._actions = [
            { type: 'PLACE', row: 0, col: 0 }
        ];
        this._updateCallback = updateCallback;
        this._finishCallback = finishCallback;
        this._currentTurn = Player.Human;
        this._playerWon = Player.None;
    }

    onUpdate(action) {
        try {
            action.player = Player.Computer;
            this.validateAction(action);
            this.performAction(action);
            if(this.checkFinish()){
                this.returnScore();
            }
            else{
                this.nextTurn();
            }
            //this.requestUpdate();
        }
        catch (error) {
            console.error('the computer made an invalid move: ', error.message);
            this._currentTurn = Player.Human;
        }
    }

    checkFinish(){
        this._playerWon = this.checkWinCondition();
        if(this._playerWon !== Player.None){
            return true;
        }
        return false;
    }

    returnScore(){
        let score = 0;
        if(this._playerWon === Player.Computer)
            score = 1;
        else if(this._playerWon === Player.Human)
            score = -1;
        this._finishCallback(this.state, score);
    }

    validateAction(action) {
        if (action.type !== 'PLACE') throw Error(`unknown action type '${action.type}'`);
        if (action.row < 0 || action.row > 2) throw Error(`row index must be between 0 and 2 (was ${action.row})`);
        if (action.col < 0 || action.col > 2) throw Error(`col index must be between 0 and 2 (was ${action.col})`);
        if (this._board[action.row][action.col] !== Player.None) throw Error(`position (${action.row}, ${action.col}) not empty`);
        if (!(action.player === Player.Human || action.player === Player.Computer)) throw Error(`this should not happen, invalid player ${action.player}`);
    }

    performAction(action) {
        this._board[action.row][action.col] = action.player;
    }

    nextTurn(){
        this._currentTurn = this._currentTurn === Player.Human ? Player.Computer : Player.Human;
    }

    checkWinCondition() {
        // check rows
        for (let i = 0; i < 3; i++)
            if (this._board[i].every(p => (p === this._board[i][0] && p !== Player.None))) return this._board[i][0];
        // check cols
        for (let i = 0; i < 3; i++)
            if (this._board.every(row => (row[i] === this._board[0][i] && row[i] !== Player.None))) return this._board[0][i];
        // check diagonals
        if(this._board[1][1] !== Player.None){
            if (this._board[1][1] === this._board[0][0] && this._board[1][1] === this._board[2][2]) return this._board[1][1];
            if (this._board[1][1] === this._board[2][0] && this._board[1][1] === this._board[0][2]) return this._board[1][1];
        }

        // check draw
        if(!this._board.flat().includes(Player.None))
            return Player.Both;

        return Player.None;
    }
}

window.customElements.define('ai-tictactoe', AiTicTacToe);
