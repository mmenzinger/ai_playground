import { html, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from 'src/store';
import { addLog, clearLog } from 'actions/log';

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
            <button @click=${this.simRun}>run</button>
            <button @click=${this.simTrain}>train</button>
            <button @click=${this.simTerminate}>terminate</button>
            <ai-tictactoe active></ai-tictactoe>
        `;//<c4f-console></c4f-console>
    }

    simRun(){
        store.dispatch(clearLog());
        this._scenario = this.shadowRoot.querySelector('[active]');
        const state = store.getState();
        const project = state.projects.currentProject;
        this._sandbox.store = store;
        this._sandbox.simRun(`local/${project}/index.js`, this._scenario).catch(e => {
            const msg = `simRun error: ${e.message}`;
            store.dispatch(addLog({type: 'error', args: [msg]}));
            console.log(msg);
        });
    }

    simTrain(){
        store.dispatch(clearLog());
        this._scenario = this.shadowRoot.querySelector('[active]');
        const state = store.getState();
        const project = state.projects.currentProject;
        this._sandbox.store = store;
        this._sandbox.simTrain(`local/${project}/index.js`, this._scenario).catch(e => {
            const msg = `simTrain error: ${e.message}`;
            store.dispatch(addLog({type: 'error', args: [msg]}));
            console.log(msg);
        });
    }

    simTerminate(){
        this._sandbox.simTerminate();
        const msg = `simulation terminated!`;
        store.dispatch(addLog({type: 'warn', args: [msg]}));
        console.warn('msg');
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
            this.simRun();
        }
    }

    stateChanged(state) {

    }
}

window.customElements.define('ai-simulator', AiSimulator);
