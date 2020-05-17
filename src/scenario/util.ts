import { serialize, deserialize, messageWithResult } from '@util';
import { MessageType, JSONMessage } from '@worker/types';


/***********************************************************************************************
 *  file handling
 */

export async function storeJson(path: string, data: any): Promise<any> {
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
        
        return messageWithResult(msg, 1000)
            .catch(_ => {
                throw Error(`could not store file ${match[2]}`);
            });
    }
}

export async function loadJson(path: string): Promise<any> {
    path = fixPath(path, '.json');
    const json = await getFileContent(path);
    return deserialize(json);
}

export async function getFileContent(path: string): Promise<string> {
    path = fixPath(path);
    const body = await fetch(path);
    if (body.status !== 200)
        throw Error(`could not open file '${path}'`)
    return await body.text();
}

function fixPath(path: string, ending: string = ''): string {
    if (! /^\//.test(path))
        path = '/' + path;
    if (! /^\/(project|global)\//.test(path)){
        path = '/project' + path;
    }
    if (! path.endsWith(ending))
        path += ending;
    return path;
}

/***********************************************************************************************
 *  local storage emulation
 */
let localStorageCache: Map<string, any>;

export async function initLocalStorage(){
    try{
        localStorageCache = new Map<string, any>(await loadJson('localstorage'));
    }
    catch(_){
        localStorageCache = new Map<string, any>();
    }
} 

function saveLocalStorage() {
   storeJson('localstorage', localStorageCache);
}

export const localStorage = {
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