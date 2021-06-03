import { html } from 'lit-element';
import { MobxLitElement } from '@adobe/lit-mobx';
import appStore from '@store/app-store';
import { ModalGeneric } from '@modal/modal-generic';
import { toJS } from 'mobx';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './c4f-modal.css';

export enum Modals  {
    GENERIC = 'generic',
}

export class ModalAbort extends Error {};

class C4fModal extends MobxLitElement {
    static get styles() {
        return [
            sharedStyles,
            style
        ];
    }

    render() {
        const open = appStore.modalOpen;
        return html`
            <div id="background" ?active="${open}">
                <div id="content">
                    <modal-generic id="${Modals.GENERIC}" class="modal" ?active="${open}"></modal-generic>
                </div>
            </div>
        `;
    }

    updated() {
        if(appStore.modal){
            const template = appStore.modal.template;
            const modal = this.shadowRoot?.getElementById(template) as ModalGeneric;
            modal.data = appStore.modal.data;
        }
    }

    firstUpdated() {
        window.onkeydown = (e: KeyboardEvent) => {
            const keys = ['Escape'];
            if(!appStore.reportOpen){
                keys.push('Enter')
            }
            if(appStore.modal && keys.includes(e.key)){
                const template = appStore.modal.template;
                const modal = this.shadowRoot?.getElementById(template) as ModalGeneric;
                if(modal && modal.onKeyDown)
                    modal.onKeyDown(e.key);
                e.preventDefault();
            }
        };
    }
}

window.customElements.define('c4f-modal', C4fModal);
