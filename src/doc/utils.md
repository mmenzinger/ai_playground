# Utils

```javascript
import * as utils from 'lib/utils.js';
```

## Table of Contents
1. [Introduction](#introduction)
2. [Exports](#exports)
    - [storeJson(path, data)](#storejsonpath-data)
    - [loadJson(path)](#loadjsonpath)
    - [getFileContent(path)](#getfilecontentpath)
    - [getCanvas()](#getcanvas)
    - [sleep(ms)](#sleepms)
    - [seedRandom(seed)](#seedrandomseed)
    - [localStorage](#localstorage)
    - [_console](#_console)


## Introduction
The util.js library provides a mixture of useful functions.

[[Top](#utils)]



## Exports


### storeJson(path, data)
Saves any object to a file using the JSON-format and returns a promise, which resolves when the file has been written.
```javascript
export declare function storeJson(path: string, data: any): Promise<any>;
```
Example:
```javascript
await utils.storeJson('project/myFile.json', { answer: 42 });
```
[[Top](#utils)]


### loadJson(path)
Loads and parses the given json-file and returns a promise with the resulting object.
```javascript
export declare function loadJson(path: string): Promise<any>;
```
Example:
```javascript
const data = await utils.loadJson('project/myFile.json');
```
[[Top](#utils)]


### getFileContent(path)
Loads and returns the content of a file as string.
```javascript
export declare function getFileContent(path: string): Promise<any>;
```
[[Top](#utils)]


### getCanvas()
Returns the main [HTML canvas](https://www.w3schools.com/html/html5_canvas.asp) as an OffscreenCanvas. This function is mainly used inside of scenarios to provide graphical feedback.
```javascript
function getCanvas(): OffscreenCanvas;
```
[[Top](#utils)]


### sleep(ms)
Returns a promise that resolved aber a given number of milliseconds.
```javascript
function sleep(ms: number): Promise<void>
```
Example:
```javascript
await sleep(500);
```
[[Top](#utils)]


### seedRandom(seed)
Returns a pseudo-random-number-generator based of a given seed. Further calls return the same sequence of pseudo-random-numbers. It is based on the [seedrandom](https://github.com/davidbau/seedrandom) library.
export declare const SeedRandom: seedrandom.seedrandom_prng;
```javascript
function seedRandom(seed: string): {
    (): number,
    quick(): number,
    int32(): number,
};
```
Example:
```javascript
const rng = utils.seedRandom('42');
console.log(rng()) // 64bit float between 0 and 1
console.log(rng.quick()) // 32bit float between 0 and 1
console.log(rng.int32()) // 32bit signed integer
```
[[Top](#utils)]


### localStorage
Simulates the [window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to provide simple access to a key-value-store.
It creates the file localstorage.json to persist its data.
```javascript
const localStorage: {
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
utils.localStorage.setItem('hello', 'world');
const value = utils.localStorage.getItem('hello');
console.log(value);
```
[[Top](#utils)]


### _console
Provides access to the normal window.console. Useful for debugging in blocking code or when logging big/many objects.
Example:
```javascript
utils._console.warn('something went wrong...');
```
[[Top](#utils)]