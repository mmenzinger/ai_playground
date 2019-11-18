importScripts('util.worker.js');

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
        if(localStorageCache.delete(key))
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
                importScripts(...m.data.files);

                const scenario = createScenario(m.data.settings);
                await scenario.run();

                m.ports[0].postMessage({ type: 'run_return' });
                break;
            }

            case 'train': {
                await localStorageLoaded;
                importScripts(...m.data.files);

                await train();

                m.ports[0].postMessage({ type: 'train_return' });
                break;
            }
        }
    }
    catch (error) {
        console.error("importScripts error:", error.message);
    }
}