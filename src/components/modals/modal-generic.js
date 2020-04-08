import { html, unsafeCSS } from 'lit-element';
import { store } from 'src/store.js';
import { LazyElement } from 'components/elements/lazy-element.js';

import { resolveModal, rejectModal } from 'actions/modal.js';
import { ModalAbort } from 'elements/c4f-modal.js';

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./modal-generic.css').toString());

class ModalGeneric extends LazyElement {
    static get properties() {
        return {
            data: { type: Object },
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
        this.data = null;
        this._error = null;
    }

    render() {
        if(this.data){
            return html`
                <h1>${this.data.title}</h1>
                ${this.data.content}
                ${this._error}
                <button id="no" @click=${this.onAbort}>${this.data.abort}</button>
                <button id="yes" @click=${this.onSubmit}>${this.data.submit}</button>
            `;
        }
        else{
            return html``;
        }
    }

    updated(){
        const firstElement = this.shadowRoot.querySelector('input,select');
        if(firstElement)
            firstElement.focus();
        if(this.data && this.data.change){
            for(let [field, callback] of Object.entries(this.data.change)){
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
            if(this.data.check){
                const error = await this.data.check(fields);
                if(error instanceof Error)
                    throw error;
            }

            store.dispatch(resolveModal(fields));

        }
        catch(error){
            this._error = html`<p class="error">${error}</p>`;
        }
    }

    onAbort(){
        this._error = null;
        store.dispatch(rejectModal(new ModalAbort()));
    }
}

window.customElements.define('modal-generic', ModalGeneric);
