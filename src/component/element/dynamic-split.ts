import { html, LitElement } from 'lit-element';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './dynamic-split.css';

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

    #drag: HTMLDivElement | undefined = undefined;
    #throttle = 0;
    direction = 'horizontal';
    minSize = '10px';
    defaultRatio = 0.5;
    saveId: number;

    render() {
        return html`<div id="wrapper"><div id="start"><slot name="start"></slot></div><div id="handle"></div><div id="end"><slot name="end"></slot></div></div>`;
    }

    firstUpdated() {
        const wrapper = this.shadowRoot?.getElementById('wrapper') as HTMLDivElement;
        const handle = this.shadowRoot?.getElementById('handle') as HTMLDivElement;
        const start = this.shadowRoot?.getElementById('start') as HTMLDivElement;
        const end = this.shadowRoot?.getElementById('end') as HTMLDivElement;

        const updateHandle = (ratio: number) => {
            start.style.flex = `${ratio}`;
            end.style.flex = `${1-ratio}`;
            if(this.saveId){
                const data = JSON.parse(localStorage.getItem(LOCALSTORE_KEY) || '{}');
                data[this.saveId] = ratio;
                localStorage.setItem(LOCALSTORE_KEY, JSON.stringify(data));
            }
        }

        const updateHandleEvent = (event: MouseEvent) => {
            const rect = wrapper.getBoundingClientRect();
            let ratio = (event.offsetX - rect.x) / rect.width;
            if(this.direction === 'vertical'){
                ratio = (event.offsetY - rect.y) / rect.height;
            }
            updateHandle(ratio);
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
            const data = JSON.parse(localStorage.getItem(LOCALSTORE_KEY) || '{}');
            const ratio = data[this.saveId] || this.defaultRatio;
            updateHandle(ratio);
        }
        else{
            updateHandle(this.defaultRatio);
        }

        handle.onmousedown = (event) => {
            if(this.#drag){
                updateHandleEvent(event);
                this.#drag = undefined;
            }
            else{
                this.#drag = handle;
                this.#throttle = performance.now();
            }
        }
        window.addEventListener('mouseup', (event) => {
            if(this.#drag){
                updateHandleEvent(event);
                this.#drag = undefined;
            }
        });
        window.addEventListener('mousemove', (event) => {
            if(this.#drag){
                const now = performance.now();
                const dt = now - this.#throttle;
                if(dt > 20){
                    this.#throttle = now;
                    updateHandleEvent(event);
                }
                event.preventDefault();
            }
        });
    }
}

window.customElements.define('dynamic-split', DynamicSplit);
