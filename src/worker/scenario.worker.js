//importScripts('util.worker.js');
import './util.worker.js';

self.window = self;

/***********************************************************************************************
 *  local storage emulation
 */
let localStorageCache = new Map();
let localStorageLoaded = new Promise((resolve, reject) => {
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

onmessage = async m => {
    try {
        switch (m.data.type) {
            case 'run': {
                await localStorageLoaded;
                const promises = [];
                const modules = {};
                m.data.files.forEach(file => {
                    promises.push(import(file.path).then(module => {
                        modules[file.name] = module;
                    }));
                });
                
                await Promise.all(promises);
                self.S = modules.scenario;

                const scenario = modules.scenario.createScenario(m.data.settings);
                await scenario.run(modules.index);

                m.ports[0].postMessage({ type: 'run_return' });
                break;
            }

            case 'train': {
                await localStorageLoaded;
                const promises = [];
                const modules = {};
                m.data.files.forEach(file => {
                    promises.push(import(file.path).then(module => {
                        modules[file.name] = module;
                    }));
                });
                await Promise.all(promises);
                self.S = modules.scenario;
                await modules.index.train();

                m.ports[0].postMessage({ type: 'train_return' });
                break;
            }
        }
    }
    catch (error) {
        console.error("importScripts error:", error);
    }
}