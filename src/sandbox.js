// store gets set by parent, else it would be a different store (scope iframe)
// scenario gets set by parent
import { addLog } from 'actions/log';
import { createFile, saveFile } from 'actions/files';
import db from 'src/localdb';

const libs = [
    'tf.min.js',
    'tau-prolog.js',
]

let worker;

function Timeout(reject) {
    return setTimeout(() => {
        if (worker)
            worker.terminate();
        worker = undefined;
        reject(Error('timeout'));
    }, 5000);
}

window.simTerminate = () => {
    if (worker)
        worker.terminate();
    worker = undefined;
}

const simSetup = () => {
    if (worker) {
        worker.terminate();
    }
    const state = store.getState();
    worker = new Worker(`scenario-worker.js?project=${state.projects.currentProject}`/*, { type: "module" }*/); // waiting for module support...

    worker.onmessage = async (m) => {
        switch (m.data.type) {
            case 'log':
            case 'error':
            case 'warn': {
                store.dispatch(addLog(m.data));
                break;
            }
            case 'store_json': {
                const file = await db.loadFileByName(m.data.project, m.data.filename);
                if (file === undefined) {
                    const id = await store.dispatch(createFile(m.data.filename, m.data.project, m.data.json));
                }
                else {
                    await store.dispatch(saveFile(file.id, m.data.json));
                }

                m.ports[0].postMessage({ type: 'store_json_return' });
                break;
            }
        }

    }
}

window.simStart = (index, scenario) => {
    return new Promise((resolve, reject) => {
        simSetup();
        const timeout = Timeout(reject);
        const channel = new MessageChannel();
        channel.port1.onmessage = m => {
            //console.log(m.data.type);
            clearTimeout(timeout);
            resolve();
        }
        worker.postMessage({
            type: 'start',
            files: [...libs, ...scenario.files, index],
            state: scenario.state
        }, [channel.port2]);
    });
}

window.simUpdate = (state, actions) => {
    return new Promise((resolve, reject) => {
        if (worker) {
            const timeout = Timeout(reject);
            const channel = new MessageChannel();
            channel.port1.onmessage = m => {
                //window.updateCallback(m.data.action);
                clearTimeout(timeout);
                resolve(m.data.action);
            }
            worker.postMessage({ type: 'update', state, actions }, [channel.port2]);
        }
        else {
            reject(Error('no scenario loaded!'));
        }
    });
}

window.simFinish = (state, score) => {
    return new Promise((resolve, reject) => {
        if (worker) {
            const timeout = Timeout(reject);
            const channel = new MessageChannel();
            channel.port1.onmessage = m => {
                //window.updateCallback(m.data.action);
                clearTimeout(timeout);
                resolve();
            }
            worker.postMessage({ type: 'finish', state, score }, [channel.port2]);
        }
        else {
            reject(Error('no scenario loaded!'));
        }
    });
}

window.simTrain = async (index, scenario) => {
    try {
        let iterations = 0;
        await new Promise((resolve, reject) => {
            simSetup();
            const timeout = Timeout(reject);
            const channel = new MessageChannel();
            channel.port1.onmessage = m => {
                clearTimeout(timeout);
                iterations = m.data.iterations;
                resolve();
            }
            worker.postMessage({
                type: 'train_start',
                files: [...libs, ...scenario.files, index],
                state: scenario.state
            }, [channel.port2]);
        });

        for (let i = 0; i < iterations; i++) {
            await new Promise((resolve, reject) => {
                const timeout = Timeout(reject);
                const channel = new MessageChannel();
                channel.port1.onmessage = m => {
                    clearTimeout(timeout);
                    resolve();
                }
                worker.postMessage({ type: 'train_update', iteration: i }, [channel.port2]);
            });
        }

        await new Promise((resolve, reject) => {
            const timeout = Timeout(reject);
            const channel = new MessageChannel();
            channel.port1.onmessage = m => {
                clearTimeout(timeout);
                resolve();
            }
            worker.postMessage({ type: 'train_finish' }, [channel.port2]);
        });
    }
    catch (error) {
        console.error(error);
    }
}