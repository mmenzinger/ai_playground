import { LitElement, html, unsafeCSS } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';

import { store } from 'src/store.js';

const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());
const style = unsafeCSS(require('./ai-header.css').toString());

class AiHeader extends connect(store)(LitElement) {
    static get properties() {
        return {
            title: { type: String },
            _offline: { type: Boolean }
        };
    }

    static get styles() {
        return [
            sharedStyles,
            style
        ];
    }

    render() {
        return html`
            <header>
                <a href="https://c4f.wtf"><img src="" alt="Coding4Fun" class="logo"></a>
                <a href="/">
                    <h1>${this.title}</h1>
                </a>
                <div id="offline_status" ?active="${this._offline}">You are currently offline!</div>
            </header>
        `;
    }

    stateChanged(state) {
        this._offline = state.app.offline;
    }
}

window.customElements.define('ai-header', AiHeader);
