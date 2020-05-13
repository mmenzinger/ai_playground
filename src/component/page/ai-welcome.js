import { html, unsafeCSS } from 'lit-element';
import { LazyElement } from '@element/lazy-element.js';
import settingsStore from 'store/settings-store.js';

import sharedStyles from '@shared-styles';
//import style from './ai-welcome.css';

class AiWelcome extends LazyElement {
    static get properties() {
        return {
            _skip: { type: Boolean },
        };
    }

    static get styles() {
        return [
            sharedStyles,
            //style
        ];
    }

    constructor() {
        super();
        this._skip = false;
    }

    render() {
        return html`
            <h1>Welcome</h1>
            <input type="checkbox" id="skip"><label for="skip">Don't show next time.</label><br>
            <button @click=${this.onContinue}>Continue</button>
        `;
    }

    async onContinue() {
        const skip = this.shadowRoot.getElementById('skip');
        if(skip.checked){
            settingsStore.set('skip_welcome', true);
        }
        location.href = '?projects';
    }

    firstUpdated() {

    }
}

window.customElements.define('ai-welcome', AiWelcome);
