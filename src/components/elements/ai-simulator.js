import { html, LitElement, unsafeCSS } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from 'src/store.js';
import { addLog, clearLog } from 'actions/log.js';

import 'components/elements/c4f-console.js';
import { getComponents } from 'src/webpack-utils.js';
import { Sandbox } from 'src/sandbox.js';
import { defer } from 'src/util.js';

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./ai-simulator.css').toString());


class AiSimulator extends connect(store)(LitElement) {
    static get properties() {
        return {
            _scenarioType: { type: String }
        };
    }

    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    constructor() {
        super();
        this._sandbox = defer();
        this._scenarioLoaded = defer();
        this._scenario = null;
    }

    render() {
        if(this._sandbox.resolved)
            this._sandbox.value.terminate();
        this._sandbox = defer();
        this._scenarioLoaded = defer();
        const type = this._scenarioType;
        if(type){
            import(`scenarios/${type}/scenario-${type}`).then(_ => {
                this._scenarioLoaded.resolve(true);
            });
            const components = getComponents().map(name => {
                const active = name.substr(9) === type ? ' active' : '';
                return unsafeHTML(`<${name}${active}></${name}>`);
            });
            return html`
                <button @click=${this.simRun}>run</button>
                <button @click=${this.simTrain}>train</button>
                <button @click=${this.simTerminate}>terminate</button>
                ${components}
            `;
        }
        else{
            return html``;
        }
    }

    async simRun() {
        store.dispatch(clearLog());
        const sandbox = await this._sandbox;
        sandbox.store = store;
        sandbox.scenario = this._scenario;
        sandbox.call(this._scenario.constructor.file, 'run', [this._scenario.getSettings()]);
    }

    async simTrain() {
        store.dispatch(clearLog());
        const sandbox = await this._sandbox;
        sandbox.store = store;
        sandbox.scenario = this._scenario;
        sandbox.call('/project/index.js', 'train');
    }

    async simTerminate() {
        const sandbox = await this._sandbox;
        sandbox.terminate();
        const msg = `simulation terminated!`;
        store.dispatch(addLog({ type: 'warn', args: [msg] }));
        console.warn(msg);
    }

    async updated(){
        await this._scenarioLoaded;
        this._scenario = this.shadowRoot.querySelector('[active]');
        this._sandbox.resolve(new Sandbox(store, this._scenario));
        if(this._scenario.constructor.autorun){   
            this.simRun()
        }
    }

    stateChanged(state) {
        if (state.projects.currentScenario !== this._scenarioType) {
            this._scenarioType = state.projects.currentScenario;
        }
    }
}

window.customElements.define('ai-simulator', AiSimulator);
