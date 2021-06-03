import { MobxLitElement } from '@adobe/lit-mobx';

export class LazyElement extends MobxLitElement {
    active: boolean;

    static get properties() {
        return {
            active: { type: Boolean }
        }
    }

    shouldUpdate() {
        return this.active;
    }
}