import { html, TemplateResult } from 'lit-element';
import { LazyElement } from '@element/lazy-element';

import { Settings, Percept, State, getTile, getPercepts, Tile, createState, getMap } from '@scenario/wumpus/scenario';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './scenario-wumpus.css';

import { IScenario } from '@scenario/types';

class ScenarioWumpus extends LazyElement implements IScenario {
    static get properties() {
        return {
            ...super.properties,
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

    _settings: Settings = {
        complexity: 1,
        size: 4,
        seed: '42',
        delay: Infinity,
    };
    _state: State;
    _map: Uint8Array;
    _events: any;
    _killedWumpus: boolean;
    _updateResolve: () => void;

    constructor() {
        super();
        this.resetWorld();
    }

    getFile(){
        return '/scenario/wumpus.js';
    }

    getAutorun() { return false; }

    render() {
        //console.log(this._state);
        const rows: TemplateResult[] = [];
        const size = this._state.size;
        if(this._state.percepts & Percept.Scream){
            this._killedWumpus = true;
            console.log("killed");
        }
        
        for (let row = 0; row < size; row++) {
            const cols = [];
            for (let col = 0; col < size; col++) {
                let type = getTile(this._state, col, row);
                if(this._map[col + row*size] >>> 5 === Tile.Wumpus && this._killedWumpus){
                    type = Tile.Empty;
                }
                const percepts = this._map[col + row*size] & 0b11111;
                let unknown = '';
                if (type === Tile.Unknown) {
                    type = this._map[col + row*size] >>> 5;
                    unknown = ' u';
                }
                let player = html``;
                if (this._state.position.x === col && this._state.position.y === row)
                    player = html`<img class="player" src="assets/wumpus/explorer.svg">`;

                let breeze = html``;
                if(percepts & Percept.Breeze)
                    breeze = html`<img class="breeze" src="assets/wumpus/breeze.svg">`;

                let stench = html``;
                if(percepts & Percept.Stench)
                    stench = html`<img class="stench" src="assets/wumpus/stench.svg">`;

                let glitter = html``;
                if(percepts & Percept.Glitter)
                    glitter = html`<img class="glitter" src="assets/wumpus/glitter.svg">`;
                cols.push(html`<td class="w${size} h${size} t${type}${unknown}">${breeze}${stench}${glitter}${player}</td>`);
            }
            rows.push(html`<tr>${cols}</tr>`);
        }

        const events: TemplateResult[] = [];
        /*for (let event of this._events) {
            events.unshift(html`<li>${event}</li>`);
        }*/


        return html`
            <h1>Wumpus World</h1>
            Complexity: <select id="complexity" @change=${(_:any)=>{this.resetWorld()}}>
                <option value="1">Easy</option>
                <option value="2">Advanced</option>
            </select>
            <br>
            Map Size: <select id="size" @change=${(_:any)=>{this.resetWorld()}}>
                <option value="4">4x4 (Small)</option>
                <option value="6">6x6 (Medium)</option>
                <option value="8">8x8 (Big)</option>
                <option value="10">10x10 (Huge)</option>
            </select>
            <br>
            Seed: <input id="seed" type="number" value="42" min="0" max="4294967295" @keyup=${(_:any)=>{this.resetWorld()}} @change=${(_:any)=>{this.resetWorld()}}>
            Delay: <select id="delay" @change=${(_:any)=>{this.updateSettings()}}>
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
        this._state = createState(this._settings);
        this._map = getMap(this._state);
        this._killedWumpus = false;
        this._events = [];
    }

    updateSettings(){
        const complexity = this.shadowRoot?.getElementById('complexity') as HTMLSelectElement;
        const size = this.shadowRoot?.getElementById('size') as HTMLInputElement;
        const seed = this.shadowRoot?.getElementById('seed') as HTMLInputElement;
        const delay = this.shadowRoot?.getElementById('delay') as HTMLSelectElement;
        if(complexity && size && seed && delay){
            this._settings = {
                complexity: Number(complexity.value),
                size: Number(size.value),
                seed: seed.value || '42',
                delay: Number(delay.value),
            };
        }
    }

    updateGUI(state: State) {
        this._state = state;
        /*this._map = map;
        if(!events){
            this._events = [];
        }
        else{
            for(let event of events)
                this._events.push(event);
        }*/
        
        return new Promise((resolve, _) => {
            const delay = (this.shadowRoot?.getElementById('delay') as HTMLSelectElement)?.value;
            this._updateResolve = resolve;
            if (delay === "0") {
                resolve();
            }
            else if (delay !== "Infinity") {
                setTimeout(resolve, Number(delay));
            }
        });
    }

    async onCall(functionName: string, args: any[]){
        return (this as any)[functionName](...args);
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
