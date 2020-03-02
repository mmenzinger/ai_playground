import { html, unsafeCSS, css, LitElement } from 'lit-element';


const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./dynamic-split.css').toString());

const LOCALSTORE_KEY = 'dynamic-split-state';

class DynamicSplit extends LitElement {
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
        this._drag = undefined;
        this._throttle = 0;
        this.direction = 'horizontal';
        this.minSize = '10px';
        this.defaultRatio = '0.5';
        this.saveId = undefined;
    }

    render() {
        return html`<div id="wrapper"><div id="start"><slot name="start"></slot></div><div id="handle"></div><div id="end"><slot name="end"></slot></div></div>`;
    }

    firstUpdated() {
        const wrapper = this.shadowRoot.getElementById('wrapper');
        const handle = this.shadowRoot.getElementById('handle');
        const start = this.shadowRoot.getElementById('start');
        const end = this.shadowRoot.getElementById('end');

        const updateHandle = (ratio) => {
            start.style.flex = `${ratio}`;
            end.style.flex = `${1-ratio}`;
            if(this.saveId){
                const data = JSON.parse(localStorage.getItem(LOCALSTORE_KEY)) || {};
                data[this.saveId] = ratio;
                localStorage.setItem(LOCALSTORE_KEY, JSON.stringify(data));
            }
        }

        const updateHandleEvent = (event) => {
            const rect = wrapper.getBoundingClientRect();
            let ratio = (event.offsetX - rect.x) / rect.width;
            if(this.direction === 'vertical'){
                ratio = (event.offsetY - rect.y) / rect.height;
            }
            updateHandle(ratio, 1-ratio);
        }

        start.style.minWidth = this.minSize;
        start.style.minHeight = this.minSize;
        end.style.minWidth = this.minSize;
        end.style.minHeight = this.minSize;
        if(this.direction === 'vertical'){
            wrapper.style.flexDirection = 'column';
            handle.style.height = '4px';
        }
        else{
            handle.style.width = '4px';
        }
        if(this.saveId){
            const data = JSON.parse(localStorage.getItem(LOCALSTORE_KEY)) || {};
            const ratio = data[this.saveId] || this.defaultRatio;
            updateHandle(ratio);
        }
        else{
            updateHandle(this.defaultRatio);
        }

        handle.onmousedown = (event) => {
            if(this._drag){
                updateHandleEvent(event);
                this._drag = undefined;
            }
            else{
                this._drag = handle;
                this._throttle = performance.now();
            }
        }
        window.addEventListener('mouseup', (event) => {
            if(this._drag){
                updateHandleEvent(event);
                this._drag = undefined;
            }
        });
        window.addEventListener('mousemove', (event) => {
            if(this._drag){
                const now = performance.now();
                const dt = now - this._throttle;
                if(dt > 20){
                    this._throttle = now;
                    updateHandleEvent(event);
                }
                event.preventDefault();
            }
        });
    }
}

window.customElements.define('dynamic-split', DynamicSplit);
