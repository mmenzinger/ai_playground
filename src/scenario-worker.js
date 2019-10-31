//------------------------------------------------------------------------------
// hack to make tensorflow available in webworker
/*if (typeof OffscreenCanvas !== "undefined") {
    self.document = {
        documentElement: {
            getElementsByTagName(){ return []; }
        },
        readyState: "complete",
        createElement: () => {
            return new OffscreenCanvas(640, 480);
        }
    };

    self.window = {
        screen: {
            width: 640,
            height: 480
        }
    };
    self.HTMLVideoElement = OffscreenCanvas;
    self.HTMLImageElement = function () { };
    class CanvasMock {
        getContext() {
            return new OffscreenCanvas(0, 0);
        }
    }
    // @ts-ignore
    self.HTMLCanvasElement = CanvasMock;
}*/
//------------------------------------------------------------------------------
//self.window = self; // needed hack for tau-prolog
/*self.document = {
    getElementById(id) {
        console.error(`invalid getElementById(${id})`);
        return undefined;
    }
}*/
const stringify = require('json-stringify-pretty-compact');

self.fixPath = (path, ending = '') => {
    if(! /^local\/[0-9]+\//.test(path))
        path = project(path);
    if(ending !== path.slice(path.length - ending.length))
        path += ending;
    return path;
}

self.project = (filename) => {
    const urlParams = new URLSearchParams(location.search);
    return `local/${urlParams.get('project')}/${filename}`;
}

self.global = (filename) => {
    return `local/0/${filename}`;
}

self.getFileContent = async (path) => {
    path = fixPath(path);
    const body = await fetch(path);
    if(body.status !== 200)
        throw Error(`could not open file '${path}'`)
    return await body.text();
}

self.storeJson = (path, object) => {
    return new Promise((resolve, reject) => {
        path = fixPath(path, '.json');
        const filename = path.match(/[^\/]+$/)[0];
        const project = Number(path.match(/^local\/([0-9]+)\//)[1]);
        const timeout = setTimeout(() => {
            reject(Error(`could not store file ${filename}`));
        }, 500);
        const json = stringify(object);
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
    return JSON.parse(json);
}

function getCaller() {
    try {
        throw Error('')
    }
    catch (error) {
        let caller_line = error.stack.split("\n")[3];
        //_console.log(caller_line);
        //_console.log(caller_line.match(/([^\/]*:[0-9]+):[0-9]+/)[1]);
        return caller_line.match(/([^\/]*:[0-9]+):[0-9]+/)[1];
    }
}

/*const _console = self.console;
self.console = {
    log(...args) {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            try {
                postMessage({ type: 'log', args, caller: getCaller() });
            }
            catch (error) {
                postMessage({ type: 'log', args: JSON.stringify(args), caller: getCaller() });
            }
        }
        _console.log(...args);
    },

    warn(...args) {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            try {
                postMessage({ type: 'warn', args, caller: getCaller() });
            }
            catch (error) {
                postMessage({ type: 'warn', args: JSON.stringify(args), caller: getCaller() });
            }
        }
        _console.warn(getCaller());
        _console.warn(...args);
    },

    error(...args) {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            try {
                postMessage({ type: 'error', args, caller: getCaller() });
            }
            catch (error) {
                postMessage({ type: 'error', args: JSON.stringify(args), caller: getCaller() });
            }
        }
        _console.error(...args);
    },
}*/

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