// store gets set by parent, else it would be a different store (scope iframe)
// scenario gets set by parent
import { addLog } from 'actions/log';
import { createFile, saveFile } from 'actions/files';
import db from 'src/localdb';

const libs = [
    {name: 'pl', path:'./tau-prolog.js'},
    {name: 'tf', path:'./tf.js'},
]

let worker;

function simSetup(scenario) {
    if (worker) {
        worker.terminate();
    }
    const state = store.getState();
    worker = new Worker(`scenario.worker.js?project=${state.projects.currentProject}`, { type: "module" }); // waiting for module support...

    worker.onmessage = async (m) => {
        switch (m.data.type) {
            case 'log':
            case 'error':
            case 'warn': {
                store.dispatch(addLog(m.data));
                break;
            }
            case 'store_json': {
                let project = 0; // global
                if(m.data.project === 'project')
                    project = state.projects.currentProject;
                const file = await db.loadFileByName(project, m.data.filename);
                if (file === undefined) {
                    const id = await store.dispatch(createFile(m.data.filename, project, m.data.json));
                }
                else {
                    await store.dispatch(saveFile(file.id, m.data.json));
                }

                m.ports[0].postMessage({ type: 'store_json_return' });
                break;
            }
            case 'init':{
                const result = await scenario.onInit(...m.data.args);
                m.ports[0].postMessage({ result });
                break;
            }
            case 'update':{
                const result = await scenario.onUpdate(...m.data.args);
                m.ports[0].postMessage({ result });
                break;
            }
            case 'finish':{
                const result = await scenario.onFinish(...m.data.args);
                m.ports[0].postMessage({ result });
                break;
            }
        }
    }

    worker.onerror = (m) => {
        console.error(m);
    }
}

window.simRun = (index, scenario) => {
    return new Promise((resolve, reject) => {
        simSetup(scenario);
        const channel = new MessageChannel();
        channel.port1.onmessage = m => {
            resolve();
        }
        worker.postMessage({
            type: 'run',
            files: [...libs, ...scenario.constructor.files, index],
            state: scenario.getInitialState(),
        }, [channel.port2]);
    });
}

window.simTrain = async (index, scenario) => {
    return new Promise((resolve, reject) => {
        simSetup();
        const channel = new MessageChannel();
        channel.port1.onmessage = m => {
            resolve();
        }
        worker.postMessage({
            type: 'train',
            files: [...libs, ...scenario.constructor.files, index],
            state: scenario.state
        }, [channel.port2]);
    });
}

window.simTerminate = () => {
    if (worker)
        worker.terminate();
    worker = undefined;
}