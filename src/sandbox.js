// store gets set by parent, else it would be a different store (scope iframe)
// scenario gets set by parent
import { addLog } from 'actions/log.js';
import { createFile, saveFile } from 'actions/files.js';
import db from 'src/localdb.js';
import { messageWithResult } from 'src/util.js';

let worker;

async function simSetup() {
    if (worker) {
        worker.terminate();
    }
    const state = store.getState();
    worker = new Worker(`scenario.worker.js?project=${state.projects.currentProject}`, { type: "module" });

    worker.onmessage = async (m) => {
        let result = undefined;
        switch (m.data.type) {
            case 'log':
            case 'error':
            case 'warn': {
                store.dispatch(addLog(m.data));
                break;
            }
            case 'store_json': {
                let project = Number(m.data.project);
                if(m.data.project === 'project')
                    project = state.projects.currentProject;
                else if(m.data.project === 'global')
                    project = 0;

                const file = await db.loadFileByName(project, m.data.filename);
                if (file === undefined) {
                    const id = await store.dispatch(createFile(m.data.filename, project, m.data.json));
                }
                else {
                    await store.dispatch(saveFile(file.id, m.data.json));
                }
                break;
            }
            case 'call':{
                result = await scenario[m.data.functionName](...m.data.args);
                break;
            }
        }
        if(m.ports.length > 0){
            m.ports[0].postMessage({ result });
        }
    }

    worker.onerror = (m) => {
        console.error(m);
    }

    const registration = await navigator.serviceWorker.ready;
    await messageWithResult({
        type: 'setProject',
        project: state.projects.currentProject,
    }, null, registration.active);
}

window.simCall = async (file, functionName, args = []) => {
    await simSetup();
    await messageWithResult({
        type: 'call',
        file,
        functionName,
        args,
    }, null, worker);
}

window.simTerminate = () => {
    if (worker)
        worker.terminate();
    worker = undefined;
}