import { html, unsafeCSS } from 'lit-element';
import { LazyElement } from 'components/lazy-element.js';

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./ai-tictactoe.css').toString());

require('./ai-tictactoe-scenario');

class AiTicTacToe extends LazyElement {
    static get properties() {
        return {
            _state: { type: Object },
            _playerWon: { type: Number },
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
        this._state = {
            board: [],
            player: scenario.Player.None,
        };
        this._updateCallback = () => {};
        this._finishCallback = () => {};
        this._playerWon = scenario.Player.None;
    }

    get files(){
        return ['scenario/tictactoe.js'];
    }

    get state() {
        return deepCopy(this._state);
    }

    render() {
        const rows = [];
        let rowId = 0;
        this._state.board.forEach(row => {
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
            case scenario.Player.Human:
                winner = html`<p>You have won!</p>`;
                break;
            case scenario.Player.Computer:
                winner = html`<p>You have lost!</p>`;
                break;
            case scenario.Player.Both:
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
        if (this._currentTurn === scenario.Player.Human && this._playerWon === scenario.Player.None) {
            try {
                const row = Number(event.target.dataset.row);
                const col = Number(event.target.dataset.col);
                const action = { type: 'PLACE', player: scenario.Player.Human, row, col };
                this._state = scenario.performAction(this._state, action);
                const winner = scenario.getWinner(this._state) ;
                if(winner !== scenario.Player.None){
                    const score = scenario.getScore(this._state);
                    this._playerWon = winner;
                    this._finishCallback(this._state, score);
                }
                else{
                    const actions = scenario.getActions(this._state);
                    this._updateCallback(this._state, actions).then(action => {
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
        this._state = {
            board: [
                [scenario.Player.None, scenario.Player.None, scenario.Player.None],
                [scenario.Player.None, scenario.Player.None, scenario.Player.None],
                [scenario.Player.None, scenario.Player.None, scenario.Player.None],
            ],
            player: scenario.Player.Human,
        };
        this._updateCallback = updateCallback;
        this._finishCallback = finishCallback;
        this._currentTurn = scenario.Player.Human;
        this._playerWon = scenario.Player.None;
    }

    onUpdate(action) {
        try {
            this._state = scenario.performAction(this._state, action);
            const winner = scenario.getWinner(this._state) ;
            if(winner !== scenario.Player.None){
                const score = scenario.getScore(this._state);
                this._playerWon = winner;
                this._finishCallback(this._state, score);
            }
            //this.requestUpdate();
        }
        catch (error) {
            console.error('the computer made an invalid move: ', error.message);
            this._currentTurn = Player.Human;
        }
    }
}

window.customElements.define('ai-tictactoe', AiTicTacToe);
