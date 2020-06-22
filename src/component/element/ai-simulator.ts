import { html } from 'lit-element';
import { MobxLitElement } from '@adobe/lit-mobx';
import projectStore from '@store/project-store';
import { throttle } from 'lodash-es';

import '@element/c4f-console';
import { Sandbox } from '@sandbox';
import { LogType } from '@store/types';
import { MessageType, EventMessage } from '@worker/types';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './ai-simulator.css';


class AiSimulator extends MobxLitElement {
    #sandbox = new Sandbox();
    #checkCanvasInterval: NodeJS.Timeout | undefined = undefined;

    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    render() {
        const project = projectStore.activeProject;
        if (project) {
            return html`
                <header>
                    <button class="ok" @click=${this.simRun}>start&nbsp;/&nbsp;restart</button>
                    <button class="warning" @click=${this.simTrain}>call&nbsp;train</button>
                    <button class="error" @click=${this.simTerminate}>terminate</button>
                </header>
            `;
        }
        else {
            return html``;
        }
    }

    async simRun() {
        await navigator.serviceWorker.ready; // make sure sw is ready
        projectStore.flushFile();
        projectStore.clearLog();
        for (const errors of Object.values(projectStore.activeProject?.errors || {})) {
            for (const error of errors) {
                projectStore.addLog(LogType.ERROR, error.args, error.caller);
            }
        }
        const canvas = await this.getCanvas();
        this.#sandbox.call('/project/index.js', 'start', canvas);
    }

    async simTrain() {
        projectStore.flushFile();
        projectStore.clearLog();
        for (const errors of Object.values(projectStore.activeProject?.errors || {})) {
            for (const error of errors) {
                projectStore.addLog(LogType.ERROR, error.args, error.caller);
            }
        }
        const canvas = await this.getCanvas();
        this.#sandbox.call('/project/index.js', 'train', canvas);
    }

    async simTerminate() {
        this.#sandbox.terminate();
        const msg = `simulation terminated!`;
        projectStore.addLog(LogType.WARN, [msg]);
        console.warn(msg);
    }

    async updated() {
        if(projectStore.activeProject){
            this.simRun();
        }
    }

    async getCanvas() {
        return new Promise<OffscreenCanvas>((resolve, _) => {
            let canvas = this.shadowRoot?.getElementById('canvas') as HTMLCanvasElement;
            if (canvas) {
                this.shadowRoot?.removeChild(canvas);
            }
            canvas = document.createElement('canvas');
            canvas.id = 'canvas';
            this.shadowRoot?.appendChild(canvas);
            canvas.onmousemove = throttle(event => {
                const msg = this.getMouseEventMessage(event, canvas, 'onmousemove');
                this.#sandbox.sendMessage(msg);
            }, 100);
            canvas.onmousedown = (event) => {
                const msg = this.getMouseEventMessage(event, canvas, 'onmousedown');
                this.#sandbox.sendMessage(msg);
            }
            canvas.onmouseup = event => {
                const msg = this.getMouseEventMessage(event, canvas, 'onmouseup');
                this.#sandbox.sendMessage(msg);
            }

            if(this.#checkCanvasInterval){
                clearInterval(this.#checkCanvasInterval);
            }
            this.#checkCanvasInterval = setInterval(() => {
                if(canvas.clientWidth > 0 && canvas.clientHeight > 0 && this.#checkCanvasInterval){
                    canvas.width = canvas.clientWidth;
                    canvas.height = canvas.clientHeight;
                    clearInterval(this.#checkCanvasInterval);
                    this.#checkCanvasInterval = undefined;
                    resolve(canvas.transferControlToOffscreen());
                }
            }, 100);
        });
    }

    getMouseEventMessage(event: MouseEvent, target: HTMLElement, callbackName: string) {
        var rect = target.getBoundingClientRect();
        var x = event.clientX - rect.left; //x position within the element.
        var y = event.clientY - rect.top;  //y position within the element.
        const msg: EventMessage = {
            type: MessageType.EVENT,
            callbackName,
            data: { x, y, width: rect.width, height: rect.height },
        };
        return msg;
    }
}

window.customElements.define('ai-simulator', AiSimulator);
