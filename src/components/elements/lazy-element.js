import { MobxLitElement } from '@adobe/lit-mobx';

export class LazyElement extends MobxLitElement {
    static get properties() {
        return {
            active: { type: Boolean }
        }
    }

    shouldUpdate() {
        return this.active;
    }
}