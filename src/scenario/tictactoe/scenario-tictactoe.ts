import { html, TemplateResult } from 'lit-element';
import { LazyElement } from '@element/lazy-element';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './scenario-tictactoe.css';

import { Player, Action } from './scenario';

import { IScenario } from '@scenario/types';

type State = {
    board: number[][],
    player: number,
}

export class ScenarioTicTacToe extends LazyElement implements IScenario {
    static get styles() {
        return [
            sharedStyles,
            style
        ];
    }

    getFile(){
        return '/scenario/tictactoe/scenario.js';
    }

    getAutorun() { return true; }

    #state: State = {
        board: [[0,0,0],[0,0,0],[0,0,0]],
        player: Player.None,
    };
    #playerWon: number;
    #update_resolve: any;

    constructor(){
        super();
        this.#playerWon = Player.None;
    }

    render() {
        const rows:TemplateResult[] = [];
        let rowId = 0;
        this.#state.board.forEach(row => {
            const cols:TemplateResult[] = [];
            let colId = 0;
            row.forEach(col => {
                if (col === 0)
                    cols.push(html`<td class="empty" @click=${this.onClick} data-row=${rowId} data-col=${colId}></td>`);
                else
                    cols.push(html`<td><img src="assets/tictactoe/${col == 1 ? 'x' : 'o'}.svg"></td>`);
                colId++;
            });
            rows.push(html`<tr>${cols}</tr>`)
            rowId++;
        });
        let winner = html``;
        switch(this.#playerWon){
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
            Starting player: <select id="player"><option value="1" selected>1 (Computer)</option><option value="2">2 (Human)</option></select>
            <table>${rows}</table>
            ${winner}
        `;
    }

    onClick(event: MouseEvent) {
        if(this.#update_resolve instanceof Function){
            try {
                if(event.target instanceof HTMLElement){
                    const row = Number(event.target.dataset.row);
                    const col = Number(event.target.dataset.col);
                    const action = { type: 'PLACE', player: this.#state.player, row, col };
                    this.#update_resolve(action);
                    this.#update_resolve = undefined;
                }
            }
            catch (error) {
                console.warn('invalid move: ', error.message);
            }
        }
        else if(this.#state.player === Player.None){
            console.log("game not started...");
        }
        else {
            if(this.#playerWon === Player.None)
                console.log("its the computers turn, give it some time...");
        }
    }

    getSettings(){
        const player = this.shadowRoot?.getElementById('player');
        return {
            startingPlayer: (player instanceof HTMLSelectElement) ? Number(player.value) : 0,
        };
    }

    async onInit(state: State){
        this.#state = state;
        this.#playerWon = Player.None;
        this.requestUpdate();
    }

    async onUpdate(state: State, _: any[]){
        this.#state = state;
        
        return new Promise((resolve, _) => {
            this.#update_resolve = resolve;
            this.requestUpdate();
        });
    }

    async onResult(_: State, _1: Action, state: State, _2: number){
        this.#state = state;
        this.requestUpdate();
    }

    async onFinish(state: State, _: number){
        this.#state = state;
        this.#playerWon = state.player;
        this.requestUpdate();
    }

    async onCall(functionName: string, args: any[]){
        return (this as any)[functionName](...args);
    }
}
window.customElements.define('scenario-tictactoe', ScenarioTicTacToe);