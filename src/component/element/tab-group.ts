import { html, LitElement } from 'lit-element';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './tab-group.css';

type Selected = {
    node: HTMLElement,
    a: HTMLAnchorElement
}

export class TabGroup extends LitElement {
    static get properties() {
        return {
            direction: { type: String },
            minSize: { type: String },
            defaultRatio: { type: Number },
            saveId: { type: String },
        }
    }

    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    #selected: Selected | null = null;
    #elements: {[key:string]: Selected} = {};
    direction = 'horizontal';
    minSize = '10px';
    defaultRatio = '0.5';
    saveId = 0;

    render() {
        return html`<header><ul></ul></header><div id="content"><slot></slot>`;
    }

    firstUpdated() {
        const slot = this.shadowRoot?.querySelector('slot') as HTMLSlotElement;
        const tabs = this.shadowRoot?.querySelector('ul') as HTMLUListElement;
        const nodes = slot.assignedNodes().filter(node => node.nodeType !== 3) as HTMLElement[]; // remove text nodes
        for(const node of nodes){
            const name = node.getAttribute('name') || '???';
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.innerHTML = name;
            li.appendChild(a);
            tabs.appendChild(li);
            this.#elements[name] = {
                node,
                a,
            };
            a.onclick = (_) => {
                this.select(name);
            };
        }
        this.select(nodes[0].getAttribute('name'));
    }

    select(name: string | null){
        if(!name){
            this.#selected = null;
        }
        else{
            if(this.#selected){
                this.#selected.a.classList.remove('active');
                this.#selected.node.style.display = 'none';
            }
            this.#selected = this.#elements[name];
            this.#selected.node.style.display = 'block';
            this.#selected.a.classList.add('active');
        }
    }
}

window.customElements.define('tab-group', TabGroup);
