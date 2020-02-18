import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';

import { hideModal } from 'actions/modal.js';

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./c4f-modal.css').toString());

class C4fModal extends connect(store)(LitElement) {
    static get properties() {
        return {
            _data: { type: Object },
            _error: {type: String },
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
        this._error = '';
    }

    render() {
        if(this._data === undefined)
            return html``;

        return html`
            <div id="modal">
                <section id="content">
                    <h1>${this._data.title}</h1>
                    ${this._data.content}
                    ${this._error}
                    <button id="no" @click=${this.onAbort}>${this._data.abort}</button>
                    <button id="yes" @click=${this.onSubmit}>${this._data.submit}</button>
                </section>
            </div>`;
    }

    updated(){
        const firstElement = this.shadowRoot.querySelector('input,select');
        if(firstElement)
            firstElement.focus();
        if(this._data && this._data.change){
            for(let [field, callback] of Object.entries(this._data.change)){
                this.shadowRoot.getElementById(field).addEventListener('change', e => callback(e, this));
            }
        }
    }

    async onSubmit(){
        try{
            const fields = {};
            this.shadowRoot.querySelectorAll('input,select').forEach(input => {
                fields[input.id] = input.value;
            })
            if(this._data.check){
                const error = await this._data.check(fields);
                if(error instanceof Error)
                    throw error;
            }
            const resolve = this._resolve;
            this.onExit();
            resolve(fields);
        }
        catch(error){
            this._error = html`<p class="error">${error}</p>`;
        }
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
        this._error = undefined;
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
