import { html, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from 'src/store';
import {clearLog} from 'actions/log';

import 'components/c4f-console';

class AiSimulator extends connect(store)(LitElement) {
    constructor(){
        super();
        this._sandbox;
        this._scenario;
    }

    render() {
        import('scenarios/ai-tictactoe');
        return html`
            <button @click=${this.simStart}>reload</button>
            <ai-tictactoe active></ai-tictactoe>
            <c4f-console></c4f-console>
        `;
    }

    simStart(){
        store.dispatch(clearLog());
        this._scenario = this.shadowRoot.querySelector('[active]');
        this._scenario.onInit(this._sandbox.simUpdate, this._sandbox.simFinish);
        const state = store.getState();
        const project = state.projects.currentProject;
        //this._sandbox.updateCallback = this._scenario.onUpdate;
        this._sandbox.store = store;
        this._sandbox.simStart(`local/${project}/index.js`, this._scenario).catch(e => {
            console.log(`simStart error: ${e.message}`);
        });
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
        this._sandbox = iframe.contentWindow;
        iframe.onload = () => {
            this.simStart();
        }
    }

    stateChanged(state) {

    }
}

window.customElements.define('ai-simulator', AiSimulator);
