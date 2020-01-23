import { html, unsafeCSS, LitElement } from 'lit-element';
import { LazyElement } from 'components/lazy-element.js';

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./scenario-tictactoe.css').toString());

import { Player } from './scenario';


class ScenarioTicTacToe extends LazyElement {
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

    static get files(){
        return [{ name:'scenario', path:'./scenarios/tictactoe/scenario.js'}];
    }

    constructor() {
        super();
        this._state = {
            board: [[0,0,0],[0,0,0],[0,0,0]],
            player: Player.None,
        };
        this._playerWon = Player.None;
        this._update_resolve = undefined;
    }

    render() {
        const rows = [];
        let rowId = 0;
        this._state.board.forEach(row => {
            const cols = [];
            let colId = 0;
            row.forEach(col => {
                if (col === 0)
                    cols.push(html`<td class="empty" @click=${this.onClick} data-row=${rowId} data-col=${colId}></td>`);
                else
                    cols.push(html`<td><img src="scenarios/tictactoe/assets/${col == 1 ? 'x' : 'o'}.png"></td>`);
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
            Starting player: <select id="player"><option value="1">1 (Computer)</option><option value="2" selected>2 (Human)</option></select>
            <table>${rows}</table>
            ${winner}
        `;
    }

    onClick(event) {
        if(this._update_resolve instanceof Function){
            try {
                const row = Number(event.target.dataset.row);
                const col = Number(event.target.dataset.col);
                const action = { type: 'PLACE', player: this._state.player, row, col };
                this._update_resolve(action);
                this._update_resolve = undefined;
            }
            catch (error) {
                console.warn('invalid move: ', error.message);
            }
        }
        else if(this._state.player === Player.None){
            console.log("game not started...");
        }
        else {
            if(this._playerWon === Player.None)
                console.log("its the computers turn, give it some time...");
        }
    }

    getSettings(){
        const player = Number(this.shadowRoot.getElementById('player').value);
        return {
            startingPlayer: player,
        };
    }

    async onInit(state){
        this._state = state;
        this._playerWon = Player.None;
    }

    async onUpdate(state, actions){
        this._state = state;
        return new Promise((resolve, reject) => {
            this._update_resolve = resolve;
        });
    }

    async onFinish(state, score){
        this._state = state;
        this._playerWon = state.player;
    }
}

window.customElements.define('scenario-tictactoe', ScenarioTicTacToe);
