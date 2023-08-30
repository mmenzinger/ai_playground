import stringify from 'json-stringify-pretty-compact';
// @ts-ignore
import deepCopy from 'deepcopy';

export { deepCopy };


export async function messageWithResult(msg: object, timeout: number | null = null, target: any = self, transfer: any[] = []): Promise<any>{
    return new Promise((resolve, reject) => {
        let to: any;
        if(timeout){
            to = setTimeout(() => {
                reject(Error(`message timeout: ${msg}`));
            }, timeout);
        }
        const channel = new MessageChannel();
        channel.port1.onmessage = m => {
            clearTimeout(to);
            resolve(m.data);
        }
        target.postMessage(msg, [channel.port2, ...transfer]);
    });
}

export function deepMap(obj: any, func: (item: any) => any): any {
    if (obj instanceof Object)
        for (const [key, value] of Object.entries(obj))
            obj[key] = deepMap(value, func);
    return func(obj);
}

export class Defer<T> {
    #resolve: (value: T) => void;
    #reject: (error: any) => void;
    promise: Promise<T>;
    resolved: boolean = false;
    value?: T;

    constructor(){
        this.promise = new Promise<T>((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
    }

    resolve(value: T): T{
        this.resolved = true;
        this.value = value;
        this.#resolve(value);
        return value;
    }

    reject(error: any): void{
        this.resolved = true;
        this.#reject(error);
    }
}

export function serialize(obj: any): string {
    function replacer(_: string, value: any) {
        if (value instanceof Error)
            return {
                type: '__ERROR__',
                message: value.message,
                stack: value.stack,
            };
        if (value instanceof Function)
            return {
                type: '__FUNCTION__',
                name: value.name,
            };
        if (value instanceof Map) {
            return {
                type: '__MAP__',
                data: [...value],
            }
        }
        if (value instanceof Set) {
            return {
                type: '__SET__',
                data: [...value],
            }
        }
        if (value instanceof Date
            || (typeof value === 'string'
                && /^\d{4}-[01]\d-[0-3]\dT[012]\d:[0-5]\d:[0-5]\d\.\d{3}Z$/.test(value)
            )
        ) {
            return {
                type: '__DATE__',
                timestamp: +new Date(value),
            }
        }
        if (value instanceof Uint8Array) {
            return {
                type: '__Uint8Array__',
                data: Array.from(value),
            }
        }
        if (value === undefined)
            return '__UNDEFINED__';
        if (value === Number.POSITIVE_INFINITY)
            return '__+INFINITY__';
        if (value === Number.NEGATIVE_INFINITY)
            return '__-INFINITY__';
        if (Number.isNaN(value))
            return '__NAN__';
        return value;
    };

    return stringify(obj, { replacer });
}

export function deserialize(json: string): any {
    function reviver(key: string, value: any) {
        if (value instanceof Object) {
            if (value.type === '__ERROR__') {
                const error = Error(value.message);
                error.stack = value.stack;
                return error;
            };
            if (value.type === '__FUNCTION__') {
                const func = self[value.name];
                if (func instanceof Function)
                    return func;
                console.warn(`Skipped ${key}: Only global functions can be deserialized!`);
                return undefined;
            }
            if (value.type === '__MAP__') {
                return new Map(value.data);
            }
            if (value.type === '__SET__') {
                return new Set(value.data);
            }
            if (value.type === '__DATE__') {
                return new Date(value.timestamp);
            }
            if (value.type === '__Uint8Array__') {
                return new Uint8Array(value.data);
            }
        }
        if (value === '__+INFINITY__')
            return Number.POSITIVE_INFINITY;
        if (value === '__-INFINITY__')
            return Number.NEGATIVE_INFINITY;
        if (value === '__NAN__')
            return NaN;
        return value;
    };

    try{
        const obj = JSON.parse(json, reviver);

        return deepMap(obj, value => {
            if (value === '__UNDEFINED__')
                return undefined;
            return value;
        });
    }
    catch(e){
        console.error(e);
    }
    
}

export function dispatchIframeEvents(iframe: HTMLIFrameElement, target: any = window) {
    const dispatchMouseEvent = (event: MouseEvent) => {
        const rect = iframe.getBoundingClientRect();
        const data = {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            clientX: event.clientX + rect.x,
            clientY: event.clientY + rect.y,
            pageX: event.pageX + rect.x,
            pageY: event.pageY + rect.y,
            x: event.x + rect.x,
            y: event.y + rect.y,
            offsetX: event.offsetX + rect.x,
            offsetY: event.offsetY + rect.y,
        };
        target.dispatchEvent(new MouseEvent(event.type, data));
    }

    const dispatchKeyEvent = (event: KeyboardEvent) => {
        target.dispatchEvent(new KeyboardEvent(event.type, event));
    }

    const container = iframe.contentWindow;
    if(container){
        container.onmousedown = dispatchMouseEvent;
        container.onmousemove = dispatchMouseEvent;
        container.onmouseup = dispatchMouseEvent;
        container.onkeydown = dispatchKeyEvent;
        container.onkeypress = dispatchKeyEvent;
        container.onkeyup = dispatchKeyEvent;
    }
    else{
        throw new UtilError('iframe has no contentWindow');
    }
    
}

export function hideImport(path: string){
    return import(/* @vite-ignore */path);
}

export function thisShouldNotHappen(){
    throw new UtilError(`Something went terribly wrong. This should never be called!`);
}

export class UtilError extends Error{};
