import { LitElement, html, unsafeCSS } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';

import { appStore } from 'store/app-store.js';
import { MobxLitElement } from '@adobe/lit-mobx';

import sharedStyles from 'components/shared-styles.css';
import style from './ai-header.css';

class AiHeader extends MobxLitElement {
    static get properties() {
        return {
            title: { type: String },
        };
    }

    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    render() {
        return html`
            <header>
                <a href="https://c4f.wtf"><img src="" alt="Coding4Fun" class="logo"></a>
                <a href="/">
                    <h1>${this.title}</h1>
                </a>
                <div id="offline_status" ?active="${appStore.offline}">You are currently offline!</div>
            </header>
        `;
    }
}

window.customElements.define('ai-header', AiHeader);
