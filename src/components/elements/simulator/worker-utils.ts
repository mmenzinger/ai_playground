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

interface ScenarioWorkerSettings{
    onmousedown: boolean,
    onmouseup: boolean,
    onmousemove: boolean,
}

export class ScenarioWorker {
    #worker: Worker | null = null;
    #messagePortWorker: MessagePort | null = null;

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

    #settings: ScenarioWorkerSettings = {
        onmousedown: false,
        onmouseup: false,
        onmousemove: false,
    };

    constructor(settings: ScenarioWorkerSettings){
        this.#settings = {...this.#settings, ...settings};
    }

    async start(displayContainer: HTMLElement): Promise<void> {
        return new Promise((resolve, _) => {
            const canvas = document.createElement('canvas');
            displayContainer.innerHTML = '';
            displayContainer.appendChild(canvas);
            canvas.width = displayContainer.offsetWidth;
            canvas.height = displayContainer.offsetHeight;
            const offscreenCanvas = canvas.transferControlToOffscreen();

            if(this.#settings.onmousedown){
                canvas.onmousedown = (e) => this.#sendMouseEvent(e, canvas, 'onmousedown');
            }
            if(this.#settings.onmouseup){
                canvas.onmouseup = (e) => this.#sendMouseEvent(e, canvas, 'onmouseup');
            }
            if(this.#settings.onmousemove){
                canvas.onmousemove = throttle((e) => this.#sendMouseEvent(e, canvas, 'onmousemove'), 100);
            }
            

            if (this.#worker) {
                this.#worker.terminate();
            }
            const channel = new MessageChannel();
            this.#worker = new Worker('/simulator/scenario-worker.js', {
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

    #sendMouseEvent(event: MouseEvent, target: HTMLElement, callbackName: MouseEvents) {
        var rect = target.getBoundingClientRect();
        var x = event.clientX - rect.left; //x position within the element.
        var y = event.clientY - rect.top;  //y position within the element.
        this.#messagePortWorker?.postMessage({
                type: callbackName,
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
}

