import { html, unsafeCSS } from 'lit-element';
import { LazyElement } from 'components/elements/lazy-element.js';
import settings from '../../settings';


const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
//const style = unsafeCSS(require('./ai-project-index.css').toString());

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
            settings.set('skip_welcome', true);
        }
        location.href = '?projects';
    }

    firstUpdated() {

    }
}

window.customElements.define('ai-welcome', AiWelcome);
