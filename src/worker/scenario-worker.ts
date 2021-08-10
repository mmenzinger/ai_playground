import { throttle } from 'lodash-es';

import cfMethods from 'console-feed/lib/definitions/Methods';
import {Methods} from 'console-feed/lib/definitions/Console';
import cfParse from 'console-feed/lib/Hook/parse';
import cfArithmetic from 'console-feed/lib/Transform/arithmetic';
import cfFunction from 'console-feed/lib/Transform/Function';
import cfMap from 'console-feed/lib/Transform/Map';
import cfReplicator from 'console-feed/lib/Transform/replicator';

import {CallMessage, EventMessage, LogMessage, Message, MessageType, VideoMessage} from './worker-utils';

/***********************************************************************************************
 *  console wrapper
 */
// reimplementation of Hook from console-feed to remove html dependency
const transforms = [cfFunction, cfArithmetic, cfMap];
const replicator = new cfReplicator();
replicator.addTransforms(transforms);
for(let method of cfMethods){
    // const nativeMethod = (console as any)[method];
    (console as any)[method] = function(...args: any[]){
        //nativeMethod.apply(this, args);
        const parsed = cfParse(method as Methods, args);
        const jsonData = replicator.encode(parsed);
        postLogMessage(jsonData);
    }
}

// send logs throttled
let logs: string[] = [];
const sendLogMessages = throttle(()=> {
    const msg: any = {
        type: 'log',
        logs,
    };
    (self as any).__messagePort?.postMessage(msg);
    logs = [];
}, 100);
function postLogMessage(jsonData: string): void{
    logs.push(jsonData);
    sendLogMessages();
}

/***********************************************************************************************
 *  message handling
 */
const messageHandler:any = {
    call: (m: MessageEvent) => call(m.data.file, m.data.functionName, m.data.args, m.ports[0]),
};

onmessage = async m => {
    if(m.data.type === 'setup'){
        const channel = new MessageChannel();
        (self as any).__messageChannel = channel;
        (self as any).__canvas = m.data.canvas;
        (self as any).__messagePort = channel.port1;
        channel.port1.onmessage = m => {
            if(messageHandler[m.data.type]){
                messageHandler[m.data.type](m);
            }
        }
        // @ts-ignore
        const util = await import(/* webpackIgnore: true */ '/lib/utils.js');
        //await util.initLocalStorage();

        m.ports[0].postMessage({
            type: 'ready',
            port: channel.port2,
        }, [channel.port2]);
    }
}

async function call(file: string, functionName: string, args: [any], resultPort: MessagePort){
    const index = await import(/* webpackIgnore: true */ file);
    if(index[functionName] instanceof Function){
        const result = await index[functionName](...args);
        resultPort.postMessage(result);
    }
    else{
        throw Error(`${file} does not have an exported function '${functionName}'`);
    }
}
// let videoFrameUpdateBusy = false;
// onmessage = async m => {
//     const msg: Message = m.data;
//     switch (msg.type) {
//         case MessageType.TEST: {
//             try{
//                 // @ts-ignore
//                 await import(/* webpackIgnore: true */ '/lib/utils.js');
//                 m.ports[0].postMessage(true);
//             }
//             catch(error){
//                 m.ports[0].postMessage(error.message);
//             }
//             break;
//         }
//         case MessageType.CALL: {
//             const data = (msg as CallMessage);
//             try {
//                 if(!data.file){
//                     data.file = '/project/index.js';
//                 }
//                 (self as any).__canvases = data.canvases;
//                 const [util, index] = await Promise.all([
//                     // @ts-ignore
//                     import(/* webpackIgnore: true */ '/lib/utils.js'),
//                     import(/* webpackIgnore: true */ data.file),
//                 ]);
//                 await util.initLocalStorage();
                
//                 if(index[data.functionName] instanceof Function){
//                     await index[data.functionName]();
//                 }
//                 else{
//                     throw Error(`index.js does not have an exported function '${data.functionName}'`);
//                 }
                
//                 // m.ports[0].postMessage({ result: true });
//                 m.ports[0].postMessage(true);
//             }
//             catch (error) {
//                 console.error(error);
//             }
//             break;
//         }
//         case MessageType.EVENT: {
//             try{
//                 const data = (msg as EventMessage);
//                 if((self as any)[data.callbackName] instanceof Function){
//                     (self as any)[data.callbackName](data.data);
//                 }
//             }
//             catch(error){
//                 console.error(error);
//             }
//             break;
//         }
//         case MessageType.VIDEO: {
//             try{
//                 const data = (msg as VideoMessage);
//                 if((self as any)['__onVideoFrameUpdate'] instanceof Function && !videoFrameUpdateBusy){
//                     videoFrameUpdateBusy = true;
//                     new Promise(async (resolve, reject) => {
//                         try{
//                             await (self as any)['__onVideoFrameUpdate'](data.bitmap);
//                             resolve(null);
//                         }
//                         catch(error){
//                             reject(error);
//                         }
                        
//                     }).then(() => {
//                         videoFrameUpdateBusy = false;
//                     }).catch((error: any) => {
//                         console.error(error);
//                     });
//                 }
//             }
//             catch(error){
//                 console.error(error);
//             }
//             break;
//         }
//     }
// }

