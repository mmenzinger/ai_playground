import { html, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';


class AiSimulator extends connect(store)(LitElement) {
    constructor(){
        super();
        this.sandbox;
    }

    render() {
        return html`
            <button @click=${this.simStart}>start</button>
            <button @click=${this.simUpdate}>update</button>
        `;
    }

    simStart(){
        const state = store.getState();
        const project = state.app.params[0];
        this.sandbox.simStart([`local/${project}/index.js`], {}).catch(e => {
            console.log("simStart error:", e.message);
        });
    }

    simUpdate(){
        this.sandbox.simUpdate({}, {});
    }

    firstUpdated() {
        const state = store.getState();
        const iframe = document.createElement('iframe');
        // 16.10.2019: srcdoc currently bugged in chrome, does not register service-worker requests
        //iframe.srcdoc = '<script src="sandbox.js"></script>';
        iframe.src = `srcdoc.html#${state.app.params[0]}`;
        iframe.sandbox = 'allow-scripts allow-same-origin';
        iframe.style.display = 'none';
        this.shadowRoot.appendChild(iframe);
        this.sandbox = iframe.contentWindow;
        iframe.onload = () => {
            this.simStart();
        }
    }

    stateChanged(state) {

    }
}

window.customElements.define('ai-simulator', AiSimulator);
