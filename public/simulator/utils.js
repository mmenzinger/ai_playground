export class ScenarioWorker {
    #worker = null;
    #messagePortWorker = null;

    #workerHandler = {
        log: (m) => {
            window.__port?.postMessage({
                type: 'log',
                logs: m.data.logs,
            });
        },
    };

    async start(displayContainer) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const offscreenCanvas = canvas.transferControlToOffscreen();
            displayContainer.innerHTML = '';
            displayContainer.appendChild(canvas);

            if (this.#worker) {
                this.#worker.terminate();
            }
            const channel = new MessageChannel();
            this.#worker = new Worker('/scenario-worker.js', {
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
                    port: channel.port2,
                },
                [channel.port2, offscreenCanvas]
            );
        });
    }

    async call(file, functionName, ...args) {
        return new Promise((resolve, reject) => {
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
                },
                [channel.port2]
            );
        });
    }

    terminate() {
        this.#worker?.terminate();
        this.#worker = null;
    }
}
