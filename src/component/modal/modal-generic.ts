import { html, TemplateResult } from 'lit-element';
import appStore from '@store/app-store';
import { LazyElement } from '@element/lazy-element';
import { ModalAbort } from '@element/c4f-modal';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './modal.css';

export type ModalTemplate = {
    title: string,
    submit: string,
    abort: string,
    content: TemplateResult,
    init?: (root: ShadowRoot) => Promise<void>,
    check?: (fields: { [key: string]: any }) => Promise<Error | true>,
    result?: (root: ShadowRoot) => Promise<any>,
    change?: { [key: string]: (e: Event, shadowRoot: ShadowRoot) => void },
}



export class ModalGeneric extends LazyElement {
    data: ModalTemplate;
    _error: TemplateResult | null;

    static get properties() {
        return {
            ...super.properties,
            data: { type: Object },
            _error: { type: String },
        }
    }

    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    render() {
        if (this.data) {
            return html`
                <form autocomplete="off" action="javascript:void(0);">
                    <header>
                        <h1>${this.data.title}</h1>
                    </header>
                    <ul>
                        ${this.data.content}
                        ${this._error}
                    </ul>
                    <footer>
                        <button id="no" class="error" @click=${this.onAbort}>${this.data.abort}</button>
                        <button id="yes" class="ok" @click=${this.onSubmit}>${this.data.submit}</button>
                    </footer>
                </form>
            `;
        }
        else {
            return html``;
        }
    }

    updated() {
        const root = this.shadowRoot;
        if (root) {
            if (this.data && this.data.init) {
                this.data.init(root);
            }
            const firstElement = root.querySelector('input,select') as HTMLElement;
            if (firstElement)
                firstElement.focus();
            if (this.data && this.data.change) {
                for (let [field, callback] of Object.entries(this.data.change)) {
                    const element = root.getElementById(field);
                    element?.addEventListener('change', e => callback(e, root));
                }
            }
        }
    }

    async onSubmit() {
        try {
            let result;
            const fields: { [key: string]: any } = {};
            const elements = this.shadowRoot?.querySelectorAll('input,select');
            if (elements) {
                elements.forEach(element => {
                    const input = element as HTMLInputElement;
                    switch (input.type) {
                        case 'checkbox':
                            fields[input.id] = input.checked;
                            break;
                        case 'file':
                            fields[input.id] = input.files;
                            break;
                        default:
                            fields[input.id] = input.value;
                    }
                })
            }
            if (this.data.check) {
                const error = await this.data.check(fields);
                if (error instanceof Error)
                    throw error;
            }

            if (this.data.result && this.shadowRoot) {
                result = this.data.result(this.shadowRoot);
            }
            else {
                result = fields;
            }

            this._error = null;
            appStore.resolveModal(result);
        }
        catch (error) {
            this._error = html`<li class="error"><p>${error}</p></li>`;
        }
    }



    onAbort() {
        this._error = null;
        appStore.rejectModal(new ModalAbort());
    }

    onKeyDown(key: string) {
        switch (key) {
            case 'Escape': this.onAbort(); break;
            case 'Enter': this.onSubmit(); break;
        }
    }
}

window.customElements.define('modal-generic', ModalGeneric);
