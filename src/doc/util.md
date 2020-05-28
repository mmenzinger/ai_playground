# Util

```javascript
import { ... } from 'scenario/util.js';
```

## Table of Contents
1. [Introduction](#introduction)
2. [Exports](#exports)
    - [init(state)](#initstate)
    - [update(state, actions)](#updatestate-actions)
    - [result(oldState, action, newState, score)](#resultoldstate-action-newstate-score)
    - [finish(state, score)](#finishstate-score)
    - [train()](#train)

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


### getFileContent(path)
Returns the content of a file as a promise resolving into a string.
```javascript
export declare function getFileContent(path: string): Promise<string>;
```
Example:
```javascript
const content = await getFileContent('project/index.js');
console.log(content);
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


### realConsole
Provides access to the normal window.console. Useful to debug in blocking code.
```javascript
export declare const realConsole: Console;
```
Example:
```javascript
realConsole.warn('something went wrong...');
```
[[Top](#util)]