import { LitElement } from 'lit-element';

export class PageElement extends LitElement {
    static get properties() {
        return {
            active: { type: Boolean }
        }
    }

    shouldUpdate() {
        return this.active;
    }
}