# Utils

```javascript
import * as _ from 'lib/utils.js';
```

## Table of Contents
1. [Introduction](#introduction)
2. [Exports](#exports)
    - [getCanvas()](#getcanvas)
    - [loadImages(paths)](#loadimagespaths)
    - [getImage(name)](#getimagename)
    - [setMessages(html)](#setmessageshtml)
    - [addMessage(html)](#addmessagehtml)
    - [storeJson(path, data)](#storejsonpath-data)
    - [loadJson(path)](#loadjsonpath)
    - [getFileContent(path)](#getfilecontentpath)
    - [onVideoFrameUpdate(callback)](#onvideoframeupdatecallback)
    - [seedRandom(seed)](#seedrandomseed)
    - [sleep(ms)](#sleepms)
    - [localStorage](#localstorage)
    - [console](#console)


## Introduction
The util.js library provides a mixture of useful functions, ranging from debugging to drawing and file handling.

[[Top](#utils)]



## Exports


### getCanvas()
Returns the main [HTML canvas](https://www.w3schools.com/html/html5_canvas.asp) as an OffscreenCanvas. This function is mainly used inside of scenarios to provide graphical feedback.
```javascript
function getCanvas(): OffscreenCanvas;
```
[[Top](#utils)]


### loadImages(paths)
Loads all given images into memory.  
They then can be used with [getImage](#getimagename).
```javascript
function loadImages(paths: string[]): Promise<void>;
```
Example:
```javascript
await _.loadImages([
    '/project/hero.png',
]);
```
[[Top](#utils)]


### getImage(name)
Returns an image, previously loaded with [loadImages](#loadimagespaths).  
The name is the filename of the image without the extension.  
Returns undefined when the image was not loaded correctly.
```javascript
function getImage(name: string): ImageBitmap | undefined;
```
Example:
```javascript
const img = _.getImage('hero');
```
[[Top](#utils)]


### setMessages(html)
Overwrites all current messages with the given html.
```javascript
function setMessages(html: string): Promise<void>;
```
Example:
```javascript
_.setMessages('<p>some text here...</p>');
```
[[Top](#utils)]


### addMessage(html)
Appends the given html at the end of the messages.
```javascript
function addMessage(html: string): Promise<void>;
```
Example:
```javascript
_.addMessage('<p>some additional text here...</p>');
```
[[Top](#utils)]


### storeJson(path, data)
Saves any object to a file using the JSON-format and returns a promise, which resolves when the file has been written.
```javascript
function storeJson(path: string, data: any): Promise<void>;
```
Example:
```javascript
await _.storeJson('project/myFile.json', { answer: 42 });
```
[[Top](#utils)]


### loadJson(path)
Loads and parses the given json-file and returns a promise with the resulting object.
```javascript
function loadJson(path: string): Promise<any>;
```
Example:
```javascript
const data = await _.loadJson('project/myFile.json');
```
[[Top](#utils)]


### getFileContent(path)
Loads and returns the content of a file as string.
```javascript
function getFileContent(path: string): Promise<any>;
```
[[Top](#utils)]


### onVideoFrameUpdate(callback)
Calls the given function whenever a camera frame is received.  
Requires a working camera.
```javascript
function onVideoFrameUpdate(callback: (data: ImageBitmap) => void): void;
```
Example:
```javascript
const canvas = _.getCanvas();
const ctx = canvas.getContext('2d');
_.onVideoFrameUpdate((data) => {
    ctx.drawImage(data, 0, 0);
});
```
[[Top](#utils)]


### seedRandom(seed)
Returns a pseudo-random-number-generator based of a given seed. Further calls return the same sequence of pseudo-random-numbers. It is based on the [seedrandom](https://github.com/davidbau/seedrandom) library.
```javascript
function seedRandom(seed: string): {
    (): number,
    quick(): number,
    int32(): number,
};
```
Example:
```javascript
const rng = _.seedRandom('42');
console.log(rng()) // 64bit float between 0 and 1
console.log(rng.quick()) // 32bit float between 0 and 1
console.log(rng.int32()) // 32bit signed integer
```
[[Top](#utils)]


### sleep(ms)
Returns a promise that resolved after a given number of milliseconds.  
```javascript
function sleep(ms: number): Promise<void>
```
Example:
```javascript
await _.sleep(500);
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
_.localStorage.setItem('hello', 'world');
const value = _.localStorage.getItem('hello');
console.log(value);
```
[[Top](#utils)]


### console
Provides access to the normal window.console. Useful for debugging in blocking code or when logging big/many objects.  

Example:
```javascript
_.console.warn('something went wrong...');
```
[[Top](#utils)]