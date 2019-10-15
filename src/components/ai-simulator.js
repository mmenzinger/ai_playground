import { html, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';
import files from 'reducers/files.js';


class AiSimulator extends connect(store)(LitElement) {
    constructor(){
        super();
        this.sandbox;
    }

    render() {
        return html`
            <button @click=${this.simLoad}>load</button>
            <button @click=${this.simUpdate}>update</button>
        `;
    }

    simLoad(){
        const state = store.getState();
        const file = state.files.opened;
        if(file !== -1){
            const code = state.files.files[state.files.opened].content;
            // '*' to work on any domain
            // https://stackoverflow.com/questions/22194409/failed-to-execute-postmessage-on-domwindow-the-target-origin-provided-does
            this.sandbox.postMessage({type:'init', code}, '*'); 
        }
    }

    simUpdate(){
        this.sandbox.postMessage({type:'update'}, '*'); 
    }

    firstUpdated() {
        var iframe = document.createElement('iframe');
        iframe.srcdoc = '<script src="sandbox.js"></script>';
        iframe.sandbox = 'allow-scripts allow-same-origin';
        iframe.style.display = 'none';
        this.shadowRoot.appendChild(iframe);
        this.sandbox = iframe.contentWindow;

        window.addEventListener('message', m => {
            if (m.source === this.sandbox) {
                if(m.data.type === 'sandbox_status' && m.data.status === 'online'){
                    this.sandbox.postMessage({type:'load_scenario', name: 'test'}, '*');
                }
                console.log('parent', m.data);
            }
        });
        
    }

    stateChanged(state) {

    }
}

window.customElements.define('ai-simulator', AiSimulator);
