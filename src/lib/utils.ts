import { StoreMessage } from '@elements/simulator/utils';
import { serialize, deserialize, messageWithResult } from '@src/utils';

import seedrandom from 'seedrandom';


export function seedRandom(seed: string){
    return seedrandom(seed);
}

export async function includeUrl(url: string, context = {}, parse = (content: string) => content ): Promise<any>{
    const body = await fetch(url);
    const content = parse(await body.text());
    
    function evalInContext(){
        eval(`${content}`);
    }
    evalInContext.call(context);
    
    return context;
}

/***********************************************************************************************
 *  file handling
 */

export async function storeJson(path: string, data: any): Promise<void> {
    path = fixPath(path, '.json');
    const match = path.match(/^\/(project|global)\/(.+$)/);
    if(match){
        const json = serialize(data);
        const projectId = (match[1] === 'global') ? 0 : undefined;
        const msg: StoreMessage = {
            type: 'store',
            projectId,
            fileName: match[2],
            data: json,
        };
        
        await messageWithResult(msg, 1000, (self as any).__messagePort)
            .catch(() => {
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

export function fixPath(path: string, ending: string = ''): string {
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

/***********************************************************************************************
 *  gui interaction
 */
export function getCanvas(id: 0 | 1 | 2 = 0): OffscreenCanvas{
    if(id !== 0)
        throw Error("multiple canvases were removed");
    return (self as any).__canvas;
}

export async function sleep(ms: number): Promise<void>{
    return new Promise((resolve, _) => {
        setTimeout(resolve, ms);
    });
} 

export async function setMessages(html: string): Promise<void>{
    throw Error("setMessages was removed");
}

export async function addMessage(html: string): Promise<void>{
    throw Error("addMessage was removed");
}

let images = new Map<string, ImageBitmap>();
export async function loadImages(paths: string[]): Promise<void> {

    const newImages = await Promise.all(paths.map(async (path) => {
        path = fixPath(path);
        const match = path.match(/\/([^\/]+)\.(png|jpeg)$/);
        let name = path;
        if(match && match.length > 1){
            name = match[1];
        }
        const bitmap = await createImageBitmap(
            await fetch(path).then(r => r.blob())
        )
        return {name, bitmap};
    }));
    for(const image of newImages){
        images.set(image.name, image.bitmap);
    }
}

export function getImage(name: string): ImageBitmap | undefined{
    return images.get(name);
}

export function onVideoFrameUpdate(callback: (data: ImageBitmap) => void){
    // @ts-ignore
    self.__onVideoFrameUpdate = callback;
}

export function onMouseDown(callback: (e?: MouseEvent) => void){
    self.onmousedown = callback;
}

export function onMouseMove(callback: (e?: MouseEvent) => void){
    self.onmousemove = callback;
}

export function onMouseUp(callback: (e?: MouseEvent) => void){
    self.onmouseup = callback;
}