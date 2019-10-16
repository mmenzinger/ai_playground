import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';

import { hideModal } from 'actions/modal';

const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());
const style = unsafeCSS(require('./c4f-modal.css').toString());

class C4fModal extends connect(store)(LitElement) {
    static get properties() {
        return {
            _data: { type: Object },
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
        this._data = undefined;
        this._resolve = undefined;
        this._reject = undefined;
    }

    render() {
        if(this._data === undefined)
            return html``;

        const fields = [];
        this._data.fields.forEach(field => {
            fields.push(html`<input type=${field.type} id=${field.id} placeholder=${field.placeholder} autofocus/><br>`);
        });
        return html`
            <div id="__modal">
                <section id="__content">
                    ${fields}
                    <button @click=${this.onAbort}>${this._data.abort}</button>
                    <button @click=${this.onSubmit}>${this._data.submit}</button>
                </section>
            </div>`;
    }

    onSubmit(){
        const result = {};
        this._data.fields.forEach(field => {
            result[field.id] = this.shadowRoot.getElementById(field.id).value;
        });
        const resolve = this._resolve;
        this.onExit();
        resolve(result);
    }

    onAbort(){
        const reject = this._reject;
        this.onExit();
        reject('modal canceled');
    }

    onInit(){
        setTimeout(() => {
            this.shadowRoot.getElementById(this._data.fields[0].id).focus();
        },0);
    }

    onExit(){
        store.dispatch(hideModal());
    }

    stateChanged(state) {
        const data = state.modal.data
        if(data !== this._data){
            this._data = data;
            this._resolve = state.modal.resolve;
            this._reject = state.modal.reject;
            if(data && data.fields && data.fields.length){
                this.onInit();
            }
        }
            
    }
}

window.customElements.define('c4f-modal', C4fModal);
