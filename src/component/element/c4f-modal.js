import { html, unsafeCSS } from 'lit-element';
import { MobxLitElement } from '@adobe/lit-mobx';
import appStore from '@store/app-store';

import sharedStyles from '@shared-styles';
import style from './c4f-modal.css';

export const Modals = {
    GENERIC: 'generic',
    UPLOAD_PROJECT: 'upload-project',
}

export class ModalAbort extends Error {};

class C4fModal extends MobxLitElement {
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
        let template = appStore.modal ? appStore.modal.template : null;
        return html`
            <div id="background" ?active="${appStore.modal !== null}">
                <div id="content">
                    <modal-generic id="${Modals.GENERIC}" class="modal" ?active="${template === Modals.GENERIC}"></modal-generic>
                    <modal-upload-project id="${Modals.UPLOAD_PROJECT}" class="modal" ?active="${template === Modals.UPLOAD_PROJECT}"></modal-upload-project>
                </div>
            </div>
        `;
    }

    updated() {
        if(appStore.modal){
            const template = appStore.modal.template;
            const modal = this.shadowRoot.getElementById(template);
            modal.data = appStore.modal.data;
            if(modal && modal.onShow)
                modal.onShow();
        }
    }

    firstUpdated() {
        window.onkeydown = (e) => {
            if(appStore.modal && ['Escape', 'Enter'].includes(e.key)){
                const modal = this.shadowRoot.getElementById(appStore.modal.template);
                if(modal && modal.onKeyDown)
                    modal.onKeyDown(e.key);
                e.preventDefault();
            }
        };
    }
}

window.customElements.define('c4f-modal', C4fModal);
