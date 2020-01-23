import { html, unsafeCSS, LitElement } from 'lit-element';
import { LazyElement } from 'components/lazy-element.js';

import { getInitialState, getMap } from './scenario';

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./scenario-wumpus.css').toString());


class ScenarioWumpus extends LazyElement {
    static get properties() {
        return {
            _state: { type: Object },
            _map: { type: Object },
            _events: { type: Array },
        };
    }

    static get styles() {
        return [
            sharedStyles,
            style
        ];
    }

    static get files() {
        return [{ name: 'scenario', path: './scenarios/wumpus/scenario.js' }];
    }

    constructor() {
        super();
        this._state = getInitialState(4);
        this._map = getMap(4, 42);
        this._events = [];
    }

    render() {
        console.log(this._state);
        const rows = [];
        for (let row = 0; row < this._state.map.length; row++) {
            const cols = [];
            for (let col = 0; col < this._state.map[row].length; col++) {
                const tile = this._state.map[row][col];
                let type = this._map[row][col].type;
                let unknown = ' u';
                if (tile) {
                    type = tile.type;
                    unknown = '';
                }
                else {
                    type = this._map[row][col].type;
                }
                let player = html``;
                if (this._state.position.x === col && this._state.position.y === row)
                    player = html`<img class="player" src="scenarios/wumpus/assets/explorer.svg">`;
                cols.push(html`<td class="w${this._state.map.length} h${this._state.map[0].length} t${type}${unknown}">${player}</td>`);
            }
            rows.push(html`<tr>${cols}</tr>`);
        }

        const events = [];
        for (let event of this._events) {
            events.unshift(html`<li>${event}</li>`);
        }


        return html`
            <h1>Wumpus World</h1>
            Complexity: <select id="complexity">
                <option value="1">Easy</option>
                <option value="2">Advanced</option>
            </select>
            <br>
            Map Size: <select id="size">
                <option value="4">4x4 (Small)</option>
                <option value="6">6x6 (Medium)</option>
                <option value="8">8x8 (Big)</option>
                <option value="10">10x10 (Huge)</option>
            </select>
            <br>
            Seed: <input id="seed" value="42">
            Delay: <select id="delay">
                <option value="None">None</option>
                <option value="100" selected>100ms</option>
                <option value="500">500ms</option>
                <option value="1000">1s</option>
                <option value="Inf">Manual</option>
            </select>
            <button @click=${this.onNextStep}>next</button>
            <table id="map">${rows}</table>
            <ul id="events">${events}</ul>
        `;
    }

    updateGUI(state, map, events) {
        this._state = state;
        this._map = map;
        if(!events){
            this._events = [];
        }
        else{
            
            for(let event of events)
                this._events.push(event);
        }
        
        return new Promise((resolve, _) => {
            const delay = this.shadowRoot.getElementById('delay').value;
            this._updateResolve = resolve;
            if (delay === "None") {
                resolve();
            }
            else if (delay !== "Inf") {
                setTimeout(resolve, Number(delay));
            }
        });
    }

    onNextStep() {
        if (this._updateResolve instanceof Function)
            this._updateResolve();
    }

    getSettings() {
        const complexity = Number(this.shadowRoot.getElementById('complexity').value);
        const size = Number(this.shadowRoot.getElementById('size').value);
        const seed = Number(this.shadowRoot.getElementById('seed').value);
        return {
            complexity,
            size,
            seed,
        };
    }
}

window.customElements.define('scenario-wumpus', ScenarioWumpus);
