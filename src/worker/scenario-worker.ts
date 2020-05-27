import { serialize } from '@util';
import StackTrace from 'stacktrace-js';
import { Caller, LogType } from '@store/types';
import { Message, MessageType, CallMessage, LogMessage } from '@worker/types';

interface Scope extends WorkerGlobalScope{
    __console: Console,
    storeJson: (path: string, data: any) => Promise<any>,
    loadJson: (path: string) => Promise<any>,
    getFileContent: (path: string) => Promise<string>,
    window: any;
}
declare var self: Scope & typeof globalThis;





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
        self.__console.log(...args);
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
    let caller: Caller | undefined = undefined;

    try{
        //let frame: StackTrace.StackFrame;
        let stack: StackTrace.StackFrame[];
        if(arg1 instanceof Error){
            stack = await StackTrace.fromError(arg1);
        }
        else{
            stack = StackTrace.getSync();
        }

        const functionNames: string[] = [];
        for(const frame of stack){
            const matchFunction = frame.functionName?.match(/([^.\s]+)$/);
            const matchFile = frame.fileName?.match(/\/(project|global)\/([^/]+)$/);
            if(matchFunction){
                if(!frame.fileName?.match(/scenario-worker\.js/))
                    functionNames.unshift(matchFunction[1]);
            }
            if(matchFile){
                const project = matchFile[1];
                const fileName = matchFile[2];
                const projectId = (project === 'global') ? 0 : undefined;

                //if(! fileName.startsWith('scenario.worker')){
                    caller = {
                        projectId,
                        fileName,
                        functionNames,
                        line: frame.lineNumber,
                        column: frame.columnNumber,
                    }
                //}
                break;
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
    const msg: Message = m.data;
    switch (msg.type) {
        case MessageType.CALL: {
            const data = (msg as CallMessage);
            try {
                if(!data.file){
                    data.file = '/project/index.js';
                }
                const [util, index] = await Promise.all([
                    // @ts-ignore
                    import(/* webpackIgnore: true */ '/scenario/util.js'),
                    import(/* webpackIgnore: true */ data.file),
                ]);
                await util.initLocalStorage();
                await index[data.functionName](...data.args);
                m.ports[0].postMessage({ result: true });
                break;
            }
            catch (error) {
                console.error(error);
            }
        }
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

