import projectStore from '@store/project-store';
import db from '@localdb';
import { messageWithResult } from '@util';
import { Scenario } from '@scenario/types';
import { Message, LogMessage, MessageType, CallMessage, JSONMessage } from '@worker/types';

export class Sandbox{
    #worker?: Worker;
    #scenario: Scenario;

    constructor(scenario: Scenario){
        this.#scenario = scenario;
        this.#worker;
    }

    async simSetup() {
        if(!projectStore.activeProject)
            throw new SandboxError("no project loaded")

        if (this.#worker) {
            this.#worker.terminate();
        }
        this.#worker = new Worker(`scenario-worker.js?project=${projectStore.activeProject.id}`, { type: "module" });
    
        this.#worker.onmessage = async (m) => {
            const msg: Message = m.data;
            let result = undefined;
            switch (msg.type) {
                case MessageType.LOG:{
                    const log = (msg as LogMessage).log;
                    projectStore.addLog(log.type, log.args, log.caller);
                    break;
                }
                case MessageType.JSON_STORE:{
                    const data = (msg as JSONMessage);
                    let project = data.projectId;
                    if(project === undefined)
                        project = projectStore.activeProject?.id;
                    
                    if(project){
                        const file = await db.loadFileByName(project, data.fileName);
                        if (file === undefined) {
                            await projectStore.createFile(data.fileName, project, data.json);
                        }
                        else {
                            await projectStore.saveFileContent(file.id, data.json);
                        }
                        break;
                    }
                    else{
                        throw new SandboxError('no active project')
                    }
                }
                case MessageType.CALL:{
                    const data = (msg as CallMessage);
                    result = await this.#scenario.onCall(data.functionName, data.args);
                    break;
                }
            }
            if(m.ports.length > 0){
                m.ports[0].postMessage({ result });
            }
        }
    
        this.#worker.onerror = (m) => {
            console.error(m);
        }
    
        const registration = await navigator.serviceWorker.ready;
        await messageWithResult({
            type: 'setProject',
            project: {
                id: projectStore.activeProject.id,
                scenario: projectStore.activeProject.scenario,
            },
        }, null, registration.active);
    }
    
    async call (file: string, functionName: string, args = []) {
        await this.simSetup();
        const msg: CallMessage = {
            type: MessageType.CALL,
            file: file,
            functionName,
            args,
        }
        await messageWithResult(msg, null, this.#worker);
    }
    
    terminate() {
        if (this.#worker)
            this.#worker.terminate();
        this.#worker = undefined;
    }
}

export class SandboxError extends Error{};