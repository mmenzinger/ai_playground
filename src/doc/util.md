# Util

```javascript
import { ... } from 'scenario/util.js';
```

## Table of Contents
1. [Introduction](#introduction)
2. [Exports](#exports)
    - [storeJson(path, data)](#storejsonpath-data)
    - [loadJson(path)](#loadjsonpath)
    - [localStorage](#localstorage)
    - [_console](#_console)


## Introduction
The util.js library provides a mixture of useful functions.

[[Top](#util)]



## Exports


### storeJson(path, data)
Saves any object to a file using the JSON-format and returns a promise, which resolves when the file has been written.
```javascript
export declare function storeJson(path: string, data: any): Promise<any>;
```
Example:
```javascript
await storeJson('project/myFile.json', { answer: 42 });
```
[[Top](#util)]


### loadJson(path)
Loads and parses the given file and returns a promise with the resulting object.
```javascript
export declare function loadJson(path: string): Promise<any>;
```
Example:
```javascript
const data = await loadJson('project/myFile.json');
```
[[Top](#util)]


### localStorage
Simulates the [window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to provide simple access to a key-value-store.
It creates the file localstorage.json to persist its data.
```javascript
export declare const localStorage: {
    length: number,
    key(n: number): string | null,
    setItem(key: string, value: any): void,
    getItem(key: string): any,
    removeItem(key: string): void,
    clear(): void,
}
```
Example:
```javascript
localStorage.setItem('hello', 'world');
const value = localStorage.getItem('hello');
console.log(value);
```
[[Top](#util)]


### _console
Provides access to the normal window.console. Useful for debugging in blocking code or when logging big/many objects.
```javascript
export declare const _console: Console;
```
Example:
```javascript
_console.warn('something went wrong...');
```
[[Top](#util)]