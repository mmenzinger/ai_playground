import { LitElement, html, unsafeCSS } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./c4f-modal.css').toString());

export const Modals = {
    GENERIC: 'generic',
    UPLOAD_PROJECT: 'upload-project',
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

    constructor(){
        super();
        this._template = null;
        this._data = null;
    }

    render() {
        return html`
            <div id="background" ?active="${this._template !== null}">
                <div id="content">
                    <modal-generic id="${Modals.GENERIC}" class="modal" ?active="${this._template === Modals.GENERIC}"></modal-generic>
                    <modal-upload-project id="${Modals.UPLOAD_PROJECT}" class="modal" ?active="${this._template === Modals.UPLOAD_PROJECT}"></modal-upload-project>
                </div>
            </div>
        `;
    }

    updated() {
        const modal = this.shadowRoot.getElementById(this._template);
        if(modal && modal.onShow)
            modal.onShow();
    }

    firstUpdated() {
        window.onkeydown = (e) => {
            if(this._template && ['Escape', 'Enter'].includes(e.key)){
                const modal = this.shadowRoot.getElementById(this._template);
                if(modal && modal.onKeyDown)
                    modal.onKeyDown(e.key);
                e.preventDefault();
            }
        };
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
