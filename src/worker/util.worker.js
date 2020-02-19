import { serialize, deserialize, messageWithResult } from 'src/util.js';


/***********************************************************************************************
 *  file handling
 */

self.storeJson = (path, data) => {
    path = fixPath(path, '.json');
    const filename = path.match(/[^\/]+$/)[0];
    const project = path.match(/^\/([0-9]+)\//)[1];
    const json = serialize(data);
    return messageWithResult({ type: 'store_json', project, filename, json }, 500)
        .catch(timeout => {
            throw Error(`could not store file ${filename}`);
        });
}

self.loadJson = async (path) => {
    path = fixPath(path, '.json');
    const json = await getFileContent(path);
    return deserialize(json);
}

self.getFileContent = async function(path) {
    path = fixPath(path);
    const body = await fetch(path);
    if (body.status !== 200)
        throw Error(`could not open file '${path}'`)
    return await body.text();
}

self.fixPath = function(path, ending = '') {
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
 *  console wrapper
 */
self.__console = self.console;
self.console = {
    log(...args) {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            postMessage({ type: 'log', args: args.map(serialize), caller: getCaller(args) });
        }
        __console.log(...args);
    },

    warn(...args) {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            postMessage({ type: 'warn', args: args.map(serialize), caller: getCaller(args) });
        }
        __console.warn(...args);
    },

    error(...args) {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            postMessage({ type: 'error', args: args.map(serialize), caller: getCaller(args) });
        }
        __console.error(...args);
    },
}

function getCaller(args) {
    try {
        if(args.length === 2 && args[1] instanceof Error){ // ungaught exception
            return args[1].stack.match(/(\w+\.js:[0-9]+)/)[1];
        }
        try {
            throw Error('')
        }
        catch (error) {
            // TODO: correct ...
            return error.stack.match(/(local\/\d+\/.*?:[0-9]+):[0-9]+/)[1];
        }
    }
    catch (e) {
        return undefined;
    }
}

