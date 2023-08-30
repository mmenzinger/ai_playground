// import store from '@store';
// import db from '@localdb';
// import { messageWithResult } from '@src/utils';
// import { Message, MessageType, CallMessage, JSONMessage, HtmlMessage } from '@worker/worker-utils';

// export class Sandbox{
//     #worker?: Worker;
//     onUpdateMessages?: (action: 'set' | 'add', html: string) => any;

//     constructor(){
//         this.#worker;
//     }

//     async simSetup() {
//         if(!store.project.activeProject)
//             throw new SandboxError("no project loaded")

//         if (this.#worker) {
//             this.#worker.terminate();
//         }
//         this.#worker = new Worker(`scenario-worker.js`, { type: "module" });
    
//         this.#worker.onmessage = async (m) => {
//             const msg: Message = m.data;
//             let result: any = undefined;
//             switch (msg.type) {
//                 case MessageType.LOG:{
//                     window.postMessage(m.data);
//                     break;
//                 }
//                 case MessageType.JSON_STORE:{
//                     const data = (msg as JSONMessage);
//                     let project = data.projectId;
//                     if(project === undefined)
//                         project = store.project.activeProject?.id;
                    
//                     if(project){
//                         try{
//                             const file = await db.loadFileByPath(project, data.fileName);
//                             await store.project.saveFileContent(file.id, data.json);
//                         }
//                         catch(_){
//                             await store.project.createFile(data.fileName, project, 0, data.json);
//                         }
//                         break;
//                     }
//                     else{
//                         throw new SandboxError('no active project')
//                     }
//                 }
//                 case MessageType.HTML:{
//                     if(this.onUpdateMessages){
//                         const data = (msg as HtmlMessage);
//                         this.onUpdateMessages(data.action, data.html);
//                     }
//                     break;
//                 }
//             }
//             if(m.ports.length > 0){
//                 m.ports[0].postMessage(result?.data || result || {}, result?.transfer || []);
//             }
//         }
    
//         this.#worker.onerror = (m) => {
//             console.error(m);
//         }
    
//         const registration = await navigator.serviceWorker.ready;
//         await messageWithResult({
//             type: 'setProject',
//             project: {
//                 id: store.project.activeProject.id,
//                 scenario: store.project.activeProject.scenario,
//             },
//         }, null, registration.active);
//     }
    
//     async call (file: string, functionName: string, canvases: OffscreenCanvas[]) {
//         await this.simSetup();
//         const msg: CallMessage = {
//             type: MessageType.CALL,
//             file: file,
//             functionName,
//             canvases,
//         }
//         await messageWithResult(msg, null, this.#worker, [...canvases]);
//     }

//     async sendMessage(msg: any, transfer: any[] = []){
//         if(this.#worker)
//             return messageWithResult(msg, null, this.#worker, transfer);
//     }
    
//     terminate() {
//         if (this.#worker)
//             this.#worker.terminate();
//         this.#worker = undefined;
//     }
// }

// export class SandboxError extends Error{};