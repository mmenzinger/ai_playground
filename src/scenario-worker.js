import { serialize, deserialize } from 'src/util';



self.project = (filename) => {
    const urlParams = new URLSearchParams(location.search);
    return `local/${urlParams.get('project')}/${filename}`;
}

self.global = (filename) => {
    return `local/0/${filename}`;
}

self.storeJson = (path, object) => {
    return new Promise((resolve, reject) => {
        path = fixPath(path, '.json');
        const filename = path.match(/[^\/]+$/)[0];
        const project = Number(path.match(/^local\/([0-9]+)\//)[1]);
        const timeout = setTimeout(() => {
            reject(Error(`could not store file ${filename}`));
        }, 500);
        const json = serialize(object);
        const channel = new MessageChannel();
        channel.port1.onmessage = m => {
            clearTimeout(timeout);
            resolve();
        }
        postMessage({ type: 'store_json', project, filename, json }, [channel.port2]);
    });
}

self.loadJson = async (path) => {
    path = fixPath(path, '.json');
    const json = await getFileContent(path);
    return deserialize(json);
}

self.include = (path) => {
    try{ importScripts(path); }
    catch{ 
        try{ importScripts(project(path)); }
        catch{ importScripts(self.global(path)); } // why is self needed here?
    }
}

self.__console = self.console;
self.console = {
    log(...args) {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            postMessage({ type: 'log', args: args.map(serialize), caller: getCaller() });
        }
        __console.log(...args);
    },

    warn(...args) {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            postMessage({ type: 'warn', args: args.map(serialize), caller: getCaller() });
        }
        __console.warn(...args);
    },

    error(...args) {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            postMessage({ type: 'error', args: args.map(serialize), caller: getCaller() });
        }
        __console.error(...args);
    },
}

function getCaller() {
    try {
        throw Error('')
    }
    catch (error) {
        try{
            let callerLine = error.stack.split("\n")[3];
            return callerLine.match(/(local\/\d+\/.*?:[0-9]+):[0-9]+/)[1];
        }
        catch{
            return undefined;
        }
    }
}

async function getFileContent(path) {
    path = fixPath(path);
    const body = await fetch(path);
    if(body.status !== 200)
        throw Error(`could not open file '${path}'`)
    return await body.text();
}

function fixPath(path, ending = '') {
    if(! /^local\/[0-9]+\//.test(path))
        path = project(path);
    if(! path.endsWith(ending))
        path += ending;
    return path;
}

onmessage = async m => {
    switch (m.data.type) {
        case 'start': {
            try {
                importScripts(...m.data.files);
            }
            catch (error) {
                console.warn("importScripts error:", error.message);
            }
            //console.log("files loaded", m.data.files);
            await init(m.data.state);
            m.ports[0].postMessage({ type: 'init_return' });
            break;
        }

        case 'update': {
            const action = await update(m.data.state, m.data.actions);
            m.ports[0].postMessage({ type: 'update_return', action });
            break;
        }

        case 'finish': {
            await finish(m.data.state, m.data.score);
            m.ports[0].postMessage({ type: 'finish_return' });
            break;
        }

        case 'train_start': {
            try {
                importScripts(...m.data.files);
            }
            catch (error) {
                console.warn("importScripts error:", error.message);
            }
            //console.log("files loaded", m.data.files);
            trainInit(m.data.state);
            m.ports[0].postMessage({ type: 'train_init_return' });
            break;
        }

        case 'train_update': {
            const action = trainUpdate(m.data.state, m.data.actions);
            m.ports[0].postMessage({ type: 'train_update_return', action });
            break;
        }

        case 'train_finish': {
            trainFinish(m.data.state, m.data.score);
            m.ports[0].postMessage({ type: 'train_finish_return' });
            break;
        }
    }
}