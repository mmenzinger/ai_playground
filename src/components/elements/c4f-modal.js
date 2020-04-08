import { LitElement, html, unsafeCSS } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';
import { installRouter } from 'pwa-helpers/router.js';
import { installOfflineWatcher } from 'pwa-helpers/network.js';

import { navigate, updateOffline } from 'actions/app.js';

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./c4f-modal.css').toString());

export const Modals = {
    GENERIC: 'generic',
}

export class ModalAbort extends Error {};

class C4fModal extends connect(store)(LitElement) {
    static get properties() {
        return {
            _template: { type: String },
            _data: { type: Object },
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
            <div id="background" ?active="${this._template !== null}">
                <div id="content">
                    <modal-generic id="${Modals.GENERIC}" class="modal" ?active="${this._template === Modals.GENERIC}"></modal-generic>
                </div>
            </div>
        `;
    }

    firstUpdated() {
    }

    stateChanged(state) {
        if(this._template !== state.modal.template){
            this._template = state.modal.template;
            this._data = state.modal.data;
            if(this._template){
                this.shadowRoot.getElementById(this._template).data = this._data;
            }
        }
    }
}

window.customElements.define('c4f-modal', C4fModal);
