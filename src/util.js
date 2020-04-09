//const stringify = require('json-stringify-pretty-compact');
import stringify from 'json-stringify-pretty-compact';
import deepCopy from 'deepcopy';

export { deepCopy };

export async function messageWithResult(msg, timeout = null, target = self){
    return new Promise((resolve, reject) => {
        let to = undefined;
        if(timeout){
            to = setTimeout(() => {
                reject(Error(`message timeout: ${msg}`));
            }, timeout);
        }
        const channel = new MessageChannel();
        channel.port1.onmessage = m => {
            clearTimeout(to);
            resolve(m.data.result);
        }
        target.postMessage(msg, [channel.port2]);
    });
}

export function deepMap(obj, func) {
    if (obj instanceof Object)
        for (const pair of Object.entries(obj))
            obj[pair[0]] = deepMap(pair[1], func);
    return func(obj);
}

export function defer(){
    let res, rej;
    const promise = new Promise((resolve, reject) => {
        res = resolve;
        rej = reject;
    });
    promise.resolve = function(val) {
        promise.resolved = true;
        promise.value = val;
        res(val);
    };
    promise.reject = function(error) {
        promise.resolved = true;
        promise.value = error;
        rej(error);
    }
    promise.resolved = false;
    promise.value = undefined;
    
    return promise;
}

export function serialize(obj) {
    function replacer(key, value) {
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

export function deserialize(json) {
    function reviver(key, value) {
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

    let obj = JSON.parse(json, reviver);
    return deepMap(obj, value => {
        if (value === '__UNDEFINED__')
            return undefined;
        return value;
    });
}

export function dispatchIframeEvents(iframe, target = window) {
    const dispatchMouseEvent = (event) => {
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

    const dispatchKeyEvent = (event) => {
        target.dispatchEvent(new KeyboardEvent(event.type, event));
    }

    const container = iframe.contentWindow;
    container.onmousedown = dispatchMouseEvent;
    container.onmousemove = dispatchMouseEvent;
    container.onmouseup = dispatchMouseEvent;
    container.onkeydown = dispatchKeyEvent;
    container.onkeypress = dispatchKeyEvent;
    container.onkeyup = dispatchKeyEvent;
}