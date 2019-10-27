import { html, unsafeCSS, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';

import { clearLog } from 'actions/log';
const stringify = require('json-stringify-pretty-compact');

const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());
const style = unsafeCSS(require('./c4f-console.css').toString());
  
class C4fConsole extends connect(store)(LitElement) {
    static get properties() {
        return {
            _logs: { type: Array },
        }
    }

    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    constructor(){
        super();
        this._logs = [];
    }

    prettyJson(arg){
        switch(typeof arg){
            case 'object': 
                return stringify(arg);
            default:
                return arg;
        }
        
    }

    render() {
        const logs = [];
        this._logs.forEach(log => {
            if(!Array.isArray(log.args))
                log.args = JSON.parse(log.args)
            const args = log.args.map(arg => this.prettyJson(arg));
            logs.push(html`<p class="${log.type}">${args}</p>`);
        });
        return html`${logs}`;
    }

    stateChanged(state) {
        if(state.log.logs !== this._logs){
            this._logs = state.log.logs;
        }
    }
}

window.customElements.define('c4f-console', C4fConsole);
