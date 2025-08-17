import { messageWithResult } from '@src/utils';
// import { throttle } from 'lodash-es';

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
    onmousedown?: boolean,
    onmouseup?: boolean,
    onmousemove?: boolean,
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
        onmousedown: false,
        onmouseup: false,
        onmousemove: false,
    };

    #mouseEventHandler = this.#sendMouseEvent.bind(this);

    constructor(container: HTMLElement, settings: ScenarioWorkerSettings){
        const urlParams = new URLSearchParams(window.location.search);
        this.#projectId = Number(urlParams.get('pid'));
        this.#container = container;
        this.#settings = {...this.#settings, ...settings};

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
        if(this.#settings.onmousedown){
            this.#canvas.addEventListener('mousedown', this.#mouseEventHandler);
        }
        if(this.#settings.onmouseup){
            this.#canvas.addEventListener('mouseup', this.#mouseEventHandler);
        }
        if(this.#settings.onmousemove){
            this.#canvas.addEventListener('mousemove', this.#mouseEventHandler);
        }
    }

    disableCaptures(){
        if(this.#settings.onmousedown){
            this.#canvas.removeEventListener('mousedown', this.#mouseEventHandler);
        }
        if(this.#settings.onmouseup){
            this.#canvas.removeEventListener('mouseup', this.#mouseEventHandler);
        }
        if(this.#settings.onmousemove){
            this.#canvas.removeEventListener('mousemove', this.#mouseEventHandler);
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
}

