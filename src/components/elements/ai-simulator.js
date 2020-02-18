import { html, LitElement, unsafeCSS } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from 'src/store.js';
import { addLog, clearLog } from 'actions/log.js';

import 'components/elements/c4f-console.js';
import { getComponents } from 'src/webpack-utils.js';

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./ai-simulator.css').toString());

class AiSimulator extends connect(store)(LitElement) {
    static get properties() {
        return {
            _scenario: { type: String }
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
        this._sandbox;
    }

    render() {
        const state = store.getState();
        const scenario = this._scenario;
        if(scenario){
            import(`scenarios/${scenario}/scenario-${scenario}`);
            const components = getComponents().map(name => {
                const active = name.substr(9) === scenario ? ' active' : '';
                return unsafeHTML(`<${name}${active}></${name}>`);
            });
            return html`
                <button @click=${this.simRun}>run</button>
                <button @click=${this.simTrain}>train</button>
                <button @click=${this.simTerminate}>terminate</button>
                ${components}
            `;//<c4f-console></c4f-console>
        }
        else{
            return html``;
        }
    }

    simRun() {
        store.dispatch(clearLog());
        const scenario = this.shadowRoot.querySelector('[active]');
        const state = store.getState();
        const project = state.projects.currentProject;
        this._sandbox.store = store;
        this._sandbox.simRun({ name: 'index', path: `./project/index.js` }, scenario).catch(e => {
            const msg = `simRun error: ${e.message}`;
            store.dispatch(addLog({ type: 'error', args: [msg] }));
            console.log(e);
        });
    }

    simTrain() {
        store.dispatch(clearLog());
        const scenario = this.shadowRoot.querySelector('[active]');
        const state = store.getState();
        const project = state.projects.currentProject;
        this._sandbox.store = store;
        this._sandbox.simTrain({ name: 'index', path: `./project/index.js` }, scenario).catch(e => {
            const msg = `simTrain error: ${e.message}`;
            store.dispatch(addLog({ type: 'error', args: [msg] }));
            console.log(e);
        });
    }

    simTerminate() {
        this._sandbox.simTerminate();
        const msg = `simulation terminated!`;
        store.dispatch(addLog({ type: 'warn', args: [msg] }));
        console.warn(msg);
    }

    firstUpdated() {
        const state = store.getState();
        const iframe = document.createElement('iframe');
        // 16.10.2019: srcdoc currently bugged in chrome, does not register service-worker requests
        //iframe.srcdoc = '<script src="sandbox.js"></script>';
        iframe.src = `srcdoc.html#${state.app.params[0]}`;
        iframe._sandbox = 'allow-scripts allow-same-origin';
        iframe.style.display = 'none';
        this.shadowRoot.appendChild(iframe);
        
        iframe.onload = () => {
            this._sandbox = iframe.contentWindow;
            const scenario = this.shadowRoot.querySelector('[active]');
            if(scenario.constructor.autorun)
                this.simRun();
        }
    }

    updated(){
        if(this._sandbox && this._scenario){
            const scenario = this.shadowRoot.querySelector('[active]');
            if(scenario.constructor.autorun)
                // wait for renderer to catch up
                setTimeout(() => this.simRun(), 0);
        }
    }

    stateChanged(state) {
        if (state.projects.currentScenario !== this._scenario) {
            this._scenario = state.projects.currentScenario;
        }
    }
}

window.customElements.define('ai-simulator', AiSimulator);
