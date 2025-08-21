import { messageWithResult } from '@src/utils';
import { throttle } from 'lodash-es';

export interface SetupMessage {
    type: 'setup',
    canvas?: OffscreenCanvas,
}

export interface CallMessage {
    type: 'call',
    file: string,
    functionName: string,
    args: any[],
}

export interface LogMessage {
    type: 'log',
    logs: string[],
}

export interface StoreMessage {
    type: 'store',
    projectId?: number,
    fileName: string,
    data: string | Blob,
}

type MouseEvents = 'onmousedown' | 'onmouseup' | 'onmousemove';
export interface MouseEventMessage {
    type: MouseEvents,
    x: number,
    y: number,
    button: number,
    altKey: boolean,
    ctrlKey: boolean,
    timeStamp: number,
}

type KeyboardEvents = 'onkeydown' | 'onkeyup' | 'onkeypress';
export interface KeyboardEventMessage {
    type: KeyboardEvents,
    key: string,
    code: string,
    altKey: boolean,
    ctrlKey: boolean,
    shiftKey: boolean,
    timeStamp: number,
}

export interface ResizeEventMessage {
    type: 'resize',
    width: number,
    height: number,
}

interface ScenarioWorkerSettings{
    captureEvents: {
        mouseDown?: boolean,
        mouseUp?: boolean,
        mouseMove?: boolean,
        keyDown?: boolean,
        keyUp?: boolean,
        keyPress?: boolean,
    }
}

export class ScenarioWorker {
    #worker: Worker | null = null;
    #messagePortWorker: MessagePort | null = null;
    #canvas: HTMLCanvasElement;

    #workerHandler: any = {
        log: (m: MessageEvent) => {
            (window as any).__port?.postMessage(m.data as LogMessage);
        },
        store: (m: MessageEvent) => {
            messageWithResult(m.data, 1000, (window as any).__port).then(() => {
                m.ports[0].postMessage(true);
            });
        },
    };

    #parentHandler: any = {
        disableCaptures: this.disableCaptures.bind(this),
        enableCaptures: this.enableCaptures.bind(this),
    }

    #container: HTMLElement;
    #projectId: number | undefined;

    #settings: ScenarioWorkerSettings = {
        captureEvents: {
            mouseDown: false,
            mouseUp: false,
            mouseMove: false,
            keyDown: false,
            keyUp: false,
            keyPress: false,
        }
    };

    #mouseEventHandler = this.#sendMouseEvent.bind(this);
    #keyboardEventHandler = this.#sendKeyboardEvent.bind(this);

    constructor(container: HTMLElement, settings: ScenarioWorkerSettings){
        const urlParams = new URLSearchParams(window.location.search);
        this.#projectId = Number(urlParams.get('pid'));
        this.#container = container;
        this.#settings = {...this.#settings, ...settings};
        window.addEventListener('resize', throttle((_) => {
            this.#messagePortWorker?.postMessage({
                type: 'resize',
                width: this.#container.offsetWidth,
                height: this.#container.offsetHeight,
            } as ResizeEventMessage);
        }, 100));

        window.onmessage = (m: MessageEvent) => {
            const type = m.data.type;
            if (this.#parentHandler[type]) {
                this.#parentHandler[type](m);
            }
        };
    }

    async start(): Promise<void> {
        return new Promise((resolve, _) => {
            this.#canvas = document.createElement('canvas');
            this.#container.innerHTML = '';
            this.#container.appendChild(this.#canvas);
            this.#canvas.width = this.#container.offsetWidth;
            this.#canvas.height = this.#container.offsetHeight;
            const offscreenCanvas = this.#canvas.transferControlToOffscreen();
            this.#canvas.focus();

            this.enableCaptures();

            if (this.#worker) {
                this.#worker.terminate();
            }
            const channel = new MessageChannel();
            this.#worker = new Worker(`/simulator/scenario-worker.js?pid=${this.#projectId}`, {
                type: 'module',
            });

            channel.port1.onmessage = (m) => {
                if (m.data.type === 'ready') {
                    this.#messagePortWorker = m.ports[0];
                    m.ports[0].onmessage = (m) => {
                        const type = m.data.type;
                        if (this.#workerHandler[type]) {
                            this.#workerHandler[type](m);
                        }
                    };
                    resolve();
                }
            };
            this.#worker.postMessage(
                {
                    type: 'setup',
                    canvas: offscreenCanvas,
                } as SetupMessage,
                [channel.port2, offscreenCanvas]
            );
            (window as any).__port?.postMessage({
                type: 'log',
                logs: [],
            } as LogMessage);
        });
    }

    enableCaptures(){
        if(this.#settings.captureEvents.mouseDown){
            this.#canvas.addEventListener('mousedown', this.#mouseEventHandler);
        }
        if(this.#settings.captureEvents.mouseUp){
            this.#canvas.addEventListener('mouseup', this.#mouseEventHandler);
        }
        if(this.#settings.captureEvents.mouseMove){
            this.#canvas.addEventListener('mousemove', this.#mouseEventHandler);
        }
        if(this.#settings.captureEvents.keyDown){
            this.#canvas.addEventListener('keydown', this.#keyboardEventHandler);
        }
        if(this.#settings.captureEvents.keyUp){
            this.#canvas.addEventListener('keyup', this.#keyboardEventHandler);
        }
        if(this.#settings.captureEvents.keyPress){
            this.#canvas.addEventListener('keypress', this.#keyboardEventHandler);
        }
    }

    disableCaptures(){
        if(this.#settings.captureEvents.mouseDown){
            this.#canvas.removeEventListener('mousedown', this.#mouseEventHandler);
        }
        if(this.#settings.captureEvents.mouseUp){
            this.#canvas.removeEventListener('mouseup', this.#mouseEventHandler);
        }
        if(this.#settings.captureEvents.mouseMove){
            this.#canvas.removeEventListener('mousemove', this.#mouseEventHandler);
        }
        if(this.#settings.captureEvents.keyDown){
            this.#canvas.removeEventListener('keydown', this.#keyboardEventHandler);
        }
        if(this.#settings.captureEvents.keyUp){
            this.#canvas.removeEventListener('keyup', this.#keyboardEventHandler);
        }
        if(this.#settings.captureEvents.keyPress){
            this.#canvas.removeEventListener('keypress', this.#keyboardEventHandler);
        }
    }

    async call(file: string, functionName: string, ...args: any[]) {
        return new Promise((resolve, _) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = (m) => {
                resolve(m.data);
            };
            this.#messagePortWorker?.postMessage(
                {
                    type: 'call',
                    file,
                    functionName,
                    args,
                } as CallMessage,
                [channel.port2]
            );
        });
    }

    terminate() {
        this.#worker?.terminate();
        this.#worker = null;
    }

    #sendMouseEvent(event: MouseEvent) {
        var rect = this.#canvas.getBoundingClientRect();
        var x = event.clientX - rect.left; //x position within the element.
        var y = event.clientY - rect.top;  //y position within the element.
        this.#messagePortWorker?.postMessage({
                type: event.type,
                x,
                y,
                width: rect.width,
                height: rect.height,
                button: event.button,
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                timeStamp: event.timeStamp,
        } as MouseEventMessage);
    }

    #sendKeyboardEvent(event: KeyboardEvent) {
        this.#messagePortWorker?.postMessage({
            type: event.type,
            key: event.key,
            code: event.code,
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            timeStamp: event.timeStamp,
        } as KeyboardEventMessage);
    }
}

