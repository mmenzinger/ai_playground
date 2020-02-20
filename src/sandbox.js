// store gets set by parent, else it would be a different store (scope iframe)
// scenario gets set by parent
import { addLog } from 'actions/log.js';
import { createFile, saveFile } from 'actions/files.js';
import db from 'src/localdb.js';
import { messageWithResult } from 'src/util.js';

export class Sandbox{
    constructor(store, scenario){
        this._store = store;
        this._scenario = scenario;
        this._worker;
    }

    async simSetup() {
        if (this._worker) {
            this._worker.terminate();
        }
        const state = this._store.getState();
        this._worker = new Worker(`scenario.worker.js?project=${state.projects.currentProject}`, { type: "module" });
    
        this._worker.onmessage = async (m) => {
            let result = undefined;
            switch (m.data.type) {
                case 'log':
                case 'error':
                case 'warn': {
                    this._store.dispatch(addLog(m.data));
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
                        const id = await this._store.dispatch(createFile(m.data.filename, project, m.data.json));
                    }
                    else {
                        await this._store.dispatch(saveFile(file.id, m.data.json));
                    }
                    break;
                }
                case 'call':{
                    result = await this._scenario[m.data.functionName](...m.data.args);
                    break;
                }
            }
            if(m.ports.length > 0){
                m.ports[0].postMessage({ result });
            }
        }
    
        this._worker.onerror = (m) => {
            console.error(m);
        }
    
        const registration = await navigator.serviceWorker.ready;
        await messageWithResult({
            type: 'setProject',
            project: state.projects.currentProject,
        }, null, registration.active);
    }
    
    async call (file, functionName, args = []) {
        await this.simSetup();
        await messageWithResult({
            type: 'call',
            file,
            functionName,
            args,
        }, null, this._worker);
    }
    
    terminate() {
        if (this._worker)
            this._worker.terminate();
        this._worker = undefined;
    }
}

