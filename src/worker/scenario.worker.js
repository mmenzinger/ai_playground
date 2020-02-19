import { serialize, deserialize, messageWithResult } from 'src/util.js';

self.window = self;
self.hideImport = (file) => import(file);

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
 *  local storage emulation
 */
let localStorageCache = new Map();
const localStorageLoaded = new Promise((resolve, reject) => {
    loadJson('localstorage').then(data => {
        localStorageCache = data;
        resolve(true);
    }).catch(e => {
        resolve(false);
    });
});

function saveLocalStorage() {
    storeJson('localstorage', localStorageCache);
}
self.localStorage = {
    get length() {
        localStorageCache.length;
    },

    key(n) {
        if (n < 0 || n >= localStorageCache.length)
            return null;
        return Array.from(localStorageCache.keys()[n])
    },

    setItem(key, value) {
        localStorageCache.set(key, value);
        saveLocalStorage();
    },

    getItem(key) {
        if (!localStorageCache.has(key))
            return null;
        return localStorageCache.get(key);
    },

    removeItem(key) {
        if (localStorageCache.delete(key))
            saveLocalStorage();
    },

    clear() {
        localStorageCache.clear();
        saveLocalStorage();
    }
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
        if(args.length === 1 && args[0] instanceof Error){
            return args[0].stack.match(/(\w+\.js:[0-9]+)/)[1];
        }
        try {
            throw Error('')
        }
        catch (error) {
            return error.stack.match(/(\w+\.js:[0-9]+)+/)[1];
        }
    }
    catch (e) {
        return undefined;
    }
}


/***********************************************************************************************
 *  message handling
 */
onmessage = async m => {
    try {
        switch (m.data.type) {
            case 'call': {
                await localStorageLoaded;
                const index = await import(m.data.file);
                await index[m.data.functionName](...m.data.args);
                m.ports[0].postMessage({ result: true });
                break;
            }
        }
    }
    catch (error) {
        console.error(error);
        throw error; // hack to get syntax error error line endings in developer console
    }
}