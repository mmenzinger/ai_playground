import { html, TemplateResult } from 'lit-element';
import { Scenario } from '@scenario/scenario';

import { Settings, EPercept, State, getTile, ETile, createState, getMap } from '@scenario/wumpus/scenario';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './scenario-wumpus.css';

class ScenarioWumpus extends Scenario {
    static get properties() {
        return {
            ...super.properties,
            _state: { type: Object },
        };
    }

    static get styles() {
        return [
            sharedStyles,
            style
        ];
    }

    settings: Settings = {
        complexity: 1,
        size: 4,
        seed: '42',
        delay: 100,
    };
    _state: State;
    #map: Uint8Array;
    #killedWumpus: boolean;
    #updateResolve: () => void;

    constructor() {
        super();
    }

    getFile(){
        return '/scenario/wumpus.js';
    }

    getAutorun() { return false; }

    render() {
        if(!this._state){
            this.resetWorld();
        }
        const rows: TemplateResult[] = [];
        const size = this._state.size;
        if(this._state.percepts & EPercept.Scream){
            this.#killedWumpus = true;
        }
        
        for (let row = 0; row < size; row++) {
            const cols = [];
            for (let col = 0; col < size; col++) {
                let type = getTile(this._state, col, row);
                if(this.#map[col + row*size] >>> 5 === ETile.Wumpus && this.#killedWumpus){
                    type = ETile.Empty;
                }
                const percepts = this.#map[col + row*size] & 0b11111;
                let unknown = '';
                if (type === ETile.Unknown) {
                    type = this.#map[col + row*size] >>> 5;
                    unknown = ' u';
                }
                let player = html``;
                if (this._state.position.x === col && this._state.position.y === row)
                    player = html`<img class="player" src="assets/wumpus/explorer.svg">`;

                let breeze = html``;
                if(percepts & EPercept.Breeze)
                    breeze = html`<img class="breeze" src="assets/wumpus/breeze.svg">`;

                let stench = html``;
                if(percepts & EPercept.Stench)
                    stench = html`<img class="stench" src="assets/wumpus/stench.svg">`;

                let glitter = html``;
                if(percepts & EPercept.Glitter)
                    glitter = html`<img class="glitter" src="assets/wumpus/glitter.svg">`;
                cols.push(html`<td class="w${size} h${size} t${type}${unknown}">${breeze}${stench}${glitter}${player}</td>`);
            }
            rows.push(html`<tr>${cols}</tr>`);
        }

        return html`
            <h1>Wumpus World</h1>
            <label for="complexity">Complexity:</label> <select id="complexity" @change=${(_:any)=>{this.resetWorld()}}>
                <option value="1" ?selected=${this.settings.complexity === 1}>Simple</option>
                <option value="2" ?selected=${this.settings.complexity === 2}>Advanced</option>
            </select>
            <br>
            <label for="size">Map Size:<label> <select id="size" @change=${(_:any)=>{this.resetWorld()}}>
                <option value="4" ?selected=${this.settings.size === 4}>4x4 (Small)</option>
                <option value="6" ?selected=${this.settings.size === 6}>6x6 (Medium)</option>
                <option value="8" ?selected=${this.settings.size === 8}>8x8 (Big)</option>
                <option value="10" ?selected=${this.settings.size === 10}>10x10 (Huge)</option>
            </select>
            <br>
            <label for="seed">Seed:</label> <input id="seed" type="number" value=${this.settings.seed} min="0" max="4294967295" @keyup=${(_:any)=>{this.resetWorld()}} @change=${(_:any)=>{this.resetWorld()}}>
            <br>
            <label for="delay">Delay:</label> <select id="delay" @change=${(_:any)=>{this.updateSettings()}}>
                <option value="0" ?selected=${this.settings.delay === 0}>None</option>
                <option value="100" ?selected=${this.settings.delay === 100}>100ms</option>
                <option value="500" ?selected=${this.settings.delay === 500}>500ms</option>
                <option value="1000" ?selected=${this.settings.delay === 1000}>1s</option>
                <option value="Infinity" ?selected=${this.settings.delay === Infinity}>Manual</option>
            </select>
            <button @click=${this.onNextStep} id="next" style="display:${
                this.settings.delay === Infinity ? 'inline-block' : 'none'
            }">next</button>
            <table id="map">${rows}</table>
        `;
    }

    resetWorld(){
        this.updateSettings();
        this._state = createState(this.settings);
        this.#map = getMap(this._state);
        this.#killedWumpus = false;
    }

    updateSettings(){
        const complexity = this.shadowRoot?.getElementById('complexity') as HTMLSelectElement;
        const size = this.shadowRoot?.getElementById('size') as HTMLInputElement;
        const seed = this.shadowRoot?.getElementById('seed') as HTMLInputElement;
        const delay = this.shadowRoot?.getElementById('delay') as HTMLSelectElement;
        const next = this.shadowRoot?.getElementById('next') as HTMLButtonElement;
        if(complexity && size && seed && delay){
            this.settings = {
                complexity: Number(complexity.value),
                size: Number(size.value),
                seed: seed.value || '42',
                delay: Number(delay.value),
            };
            this.saveSettings();

            if(this.settings.delay === Infinity){
                next.style.display = 'inline-block';
            }
            else{
                next.style.display = 'none';
            }
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
            this.#updateResolve = resolve;
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
        if (this.#updateResolve instanceof Function)
            this.#updateResolve();
    }

    getSettings() {
        return this.settings;
    }
}

window.customElements.define('scenario-wumpus', ScenarioWumpus);
export function getHtmlElement(active: boolean, settings: Settings){
    if(settings){
        return html`<scenario-wumpus ?active=${active} .settings=${settings}></scenario-wumpus>`;
    }
    return html`<scenario-wumpus ?active=${active}></scenario-wumpus>`;
}