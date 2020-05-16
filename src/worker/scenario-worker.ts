import { serialize, deserialize, messageWithResult } from '@util';
import StackTrace from 'stacktrace-js';
import { Caller, LogType } from '@store/types';
import { Message, MessageType, JSONMessage, CallMessage, LogMessage } from '@worker/types';

interface Scope extends WorkerGlobalScope{
    __console: Console,
    storeJson: (path: string, data: any) => Promise<any>,
    loadJson: (path: string) => Promise<any>,
    getFileContent: (path: string) => Promise<string>,
    window: any;
}
declare var self: Scope & typeof globalThis;


/***********************************************************************************************
 *  file handling
 */

self.storeJson = async function(path: string, data: any): Promise<any> {
    path = fixPath(path, '.json');
    const match = path.match(/\/?([^\/]+)\/([^\/]+$)/);
    if(match){
        const json = serialize(data);
        const projectId = (match[1] === 'global') ? 0 : undefined;
        const msg: JSONMessage = { 
            type: MessageType.JSON_STORE,
            projectId,
            fileName: match[2],
            json,
        };
        return messageWithResult(msg, 500)
            .catch(_ => {
                throw Error(`could not store file ${match[2]}`);
            });
    }
    //const filename = path.match(/[^\/]+$/)[0];
    //const project = path.match(/^\/([0-9]+)\//)[1];
}

self.loadJson = async function(path: string): Promise<any> {
    path = fixPath(path, '.json');
    const json = await self.getFileContent(path);
    return deserialize(json);
}

self.getFileContent = async function(path: string): Promise<string> {
    path = fixPath(path);
    const body = await fetch(path);
    if (body.status !== 200)
        throw Error(`could not open file '${path}'`)
    return await body.text();
}

function fixPath(path: string, ending: string = ''): string {
    if (! /^\//.test(path))
        path = '/' + path;
    if (! /^\/[0-9]+\//.test(path)){
        const params = new URLSearchParams(self.location.search);
        const project = params.get('project');
        path = `/${project}${path}`;
    }
    if (! path.endsWith(ending))
        path += ending;
    return path;
}


/***********************************************************************************************
 *  local storage emulation
 */
let localStorageCache = new Map<string, any>();
const localStorageLoaded = new Promise((resolve, _) => {
    self.loadJson('localstorage').then(data => {
        localStorageCache = data;
        resolve(true);
    }).catch(_ => {
        resolve(false);
    });
});

function saveLocalStorage() {
    self.storeJson('localstorage', localStorageCache);
}
// @ts-ignore
const localStorage = {
    get length(): number {
        return localStorageCache.size;
    },

    key(n: number): string | null {
        if (n < 0 || n >= localStorageCache.size)
            return null;
        return Array.from(localStorageCache.keys())[n];
    },

    setItem(key: string, value: any): void {
        localStorageCache.set(key, value);
        saveLocalStorage();
    },

    getItem(key: string): any {
        if (!localStorageCache.has(key))
            return null;
        return localStorageCache.get(key);
    },

    removeItem(key: string): void {
        if (localStorageCache.delete(key))
            saveLocalStorage();
    },

    clear(): void {
        localStorageCache.clear();
        saveLocalStorage();
    }
}


/***********************************************************************************************
 *  console wrapper
 */
self.__console = self.console;
// @ts-ignore
self.console = {
    log(...args: any[]) {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            getCaller(...args).then(caller => {
                postLogMessage(LogType.LOG, args.map(serialize), caller);
            });
        }
        //self.__console.log(...args);
    },

    warn(...args: any[]) {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            getCaller(...args).then(caller => {
                postLogMessage(LogType.WARN, args.map(serialize), caller);
            });
        }
        self.__console.warn(...args);
    },

    error(...args: any[]) {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            getCaller(...args).then(caller => {
                postLogMessage(LogType.ERROR, args.map(serialize), caller);
            });
        }
        self.__console.error(...args);
    },
}

async function getCaller(arg1?: any): Promise<Caller | undefined> {
    let caller;

    try{
        let frame: StackTrace.StackFrame;
        if(arg1 instanceof Error){
            const stack = await StackTrace.fromError(arg1);
            frame = stack[0];
        }
        else{
            const stack = StackTrace.getSync();
            frame = stack[2];
        }
        
        if(frame.fileName){
            const match = frame.fileName.match(/\/([^/]+)\/([^/]+)$/);
            if(match){
                const project = match[1];
                const fileName = match[2];
                let functionName: string | undefined = undefined;
                if(frame.functionName){
                    const match = frame.functionName.match(/([^.]+)$/);
                    if(match){
                        functionName = match[1];
                    }
                }
                const projectId = (project === 'global') ? 0 : undefined;

                if(! fileName.startsWith('scenario.worker')){
                    caller = {
                        projectId,
                        fileName,
                        functionName,
                        line: frame.lineNumber,
                        column: frame.columnNumber,
                    }
                }
            }
        }
    }
    catch(error){
        self.__console.error(error);
    }
    
    return caller;
}


/***********************************************************************************************
 *  message handling
 */
onmessage = async m => {
    try {
        const msg: Message = m.data;
        switch (msg.type) {
            case MessageType.CALL: {
                const data = (msg as CallMessage);
                if(!data.file)
                    data.file = '/project/index.js';
                await localStorageLoaded;
                const index = await import(/* webpackIgnore: true */ data.file);
                await index[data.functionName](...data.args);
                m.ports[0].postMessage({ result: true });
                break;
            }
        }
    }
    catch (error) {
        console.error(error);
    }
}

function postLogMessage(type: LogType, args: any[], caller?: Caller): void{
    const msg: LogMessage = {
        type: MessageType.LOG,
        log: {
            type,
            args,
            caller,
        }
    }
    postMessage(msg);
}

