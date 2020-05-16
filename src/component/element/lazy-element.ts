import { MobxLitElement } from '@adobe/lit-mobx';
import { property } from 'lit-element';

export class LazyElement extends MobxLitElement {
    /*static get properties() {
        return {
            active: { type: Boolean }
        }
    }

    active: boolean;*/

    @property( { type : Boolean }  ) active = false;

    shouldUpdate() {
        return this.active;
    }
}