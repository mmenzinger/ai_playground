import { html, unsafeCSS, css, LitElement } from 'lit-element';


import sharedStyles from '@shared-styles';
import style from './tab-group.css';


class TabGroup extends LitElement {
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

    constructor() {
        super();
        this._selected = undefined;
        this._elements = {};
        this.direction = 'horizontal';
        this.minSize = '10px';
        this.defaultRatio = '0.5';
        this.saveId = undefined;
    }

    render() {
        return html`<header><ul></ul></header><div id="content"><slot></slot>`;
    }

    firstUpdated() {
        const slot = this.shadowRoot.querySelector('slot');
        const tabs = this.shadowRoot.querySelector('ul');
        const nodes = slot.assignedNodes().filter(node => node.nodeType !== 3); // remove text nodes
        for(const node of nodes){
            const name = node.getAttribute('name');
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.innerHTML = name;
            li.appendChild(a);
            tabs.appendChild(li);
            this._elements[name] = {
                node,
                a,
            };
            a.onclick = (event) => {
                this.select(name);
            };
        }
        this.select(nodes[0].getAttribute('name'));
    }

    select(name){
        if(this._selected){
            this._selected.a.classList.remove('active');
            this._selected.node.style.display = 'none';
        }
        this._selected = this._elements[name];
        this._selected.node.style.display = 'block';
        this._selected.a.classList.add('active');
    }
}

window.customElements.define('tab-group', TabGroup);
