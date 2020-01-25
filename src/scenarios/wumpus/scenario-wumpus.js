import { html, unsafeCSS, LitElement } from 'lit-element';
import { LazyElement } from 'components/lazy-element.js';

import { getInitialState, getMap, Percept } from './scenario';

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./scenario-wumpus.css').toString());


class ScenarioWumpus extends LazyElement {
    static get properties() {
        return {
            _state: { type: Object },
            _map: { type: Object },
            _events: { type: Array },
            _settings: { type: Object },
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

    static get autorun() { return false; }

    constructor() {
        super();
        this._settings = {
            complexity: 1,
            size: 4,
            seed: 42,
            delay: Infinity,
        };
        this.resetWorld();
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

                let breeze = html``;
                if(this._map[row][col].percept & Percept.Breeze)
                    breeze = html`<img class="breeze" src="scenarios/wumpus/assets/breeze.svg">`;

                let stench = html``;
                if(this._map[row][col].percept & Percept.Stench)
                    stench = html`<img class="stench" src="scenarios/wumpus/assets/stench.svg">`;

                let glitter = html``;
                if(this._map[row][col].percept & Percept.Glitter)
                    glitter = html`<img class="glitter" src="scenarios/wumpus/assets/glitter.svg">`;
                cols.push(html`<td class="w${this._state.map.length} h${this._state.map[0].length} t${type}${unknown}">${breeze}${stench}${glitter}${player}</td>`);
            }
            rows.push(html`<tr>${cols}</tr>`);
        }

        const events = [];
        for (let event of this._events) {
            events.unshift(html`<li>${event}</li>`);
        }


        return html`
            <h1>Wumpus World</h1>
            Complexity: <select id="complexity" @change=${_=>{this.resetWorld()}}>
                <option value="1">Easy</option>
                <option value="2">Advanced</option>
            </select>
            <br>
            Map Size: <select id="size" @change=${_=>{this.resetWorld()}}>
                <option value="4">4x4 (Small)</option>
                <option value="6">6x6 (Medium)</option>
                <option value="8">8x8 (Big)</option>
                <option value="10">10x10 (Huge)</option>
            </select>
            <br>
            Seed: <input id="seed" type="number" value="42" min="0" max="4294967295" @keyup=${_=>{this.resetWorld()}} @change=${_=>{this.resetWorld()}}>
            Delay: <select id="delay" @change=${_=>{this.updateSettings()}}>
                <option value="0">None</option>
                <option value="100" selected>100ms</option>
                <option value="500">500ms</option>
                <option value="1000">1s</option>
                <option value="Infinity">Manual</option>
            </select>
            <button @click=${this.onNextStep}>next</button>
            <table id="map">${rows}</table>
            <ul id="events">${events}</ul>
        `;
    }

    resetWorld(){
        this.updateSettings();
        console.log(this._settings);
        this._state = getInitialState(this._settings.size);
        this._map = getMap(this._settings.size, this._settings.seed);
        this._events = [];
    }

    updateSettings(){
        const complexity = this.shadowRoot.getElementById('complexity');
        const size = this.shadowRoot.getElementById('size');
        const seed = this.shadowRoot.getElementById('seed');
        const delay = this.shadowRoot.getElementById('delay');
        if(complexity && size && seed && delay){
            this._settings = {
                complexity: Number(complexity.value),
                size: Number(size.value),
                seed: Number(seed.value) || 42,
                delay: Number(delay.value),
            };
        }
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
        return this._settings;
    }
}

window.customElements.define('scenario-wumpus', ScenarioWumpus);
