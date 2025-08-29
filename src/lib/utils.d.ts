type MouseEvents = 'onmousedown' | 'onmouseup' | 'onmousemove';
export interface MouseEventMessage {
    type: MouseEvents,
    x: number,
    y: number,
    button: number,
    altKey: boolean,
    ctrlKey: boolean,
    timeStamp: number,
}

type KeyboardEvents = 'onkeydown' | 'onkeyup' | 'onkeypress';
export interface KeyboardEventMessage {
    type: KeyboardEvents,
    key: string,
    code: string,
    altKey: boolean,
    ctrlKey: boolean,
    shiftKey: boolean,
    timeStamp: number,
}

export interface ResizeEventMessage {
    type: 'resize',
    width: number,
    height: number,
}

export declare function storeJson(path: string, data: any): Promise<void>;
export declare function loadJson(path: string): Promise<any>;
export declare function getFileContent(path: string): Promise<string>;
export declare const localStorage: {
    length: number,
    key(n: number): string | null,
    setItem(key: string, value: any): void,
    getItem(key: string): any,
    removeItem(key: string): void,
    clear(): void,
}
export declare const console: Console;
export declare function getCanvas(id?: 0 | 1 | 2): OffscreenCanvas;
export declare function seedRandom(seed?: string): {
    (): number,
    quick(): number,
    int32(): number,
};
export declare function sleep(ms: number): Promise<void>
export declare function setMessages(html: string): Promise<void>;
export declare function addMessage(html: string): Promise<void>;
export declare function loadImages(paths: string[]): Promise<void>;
export declare function getImage(name: string): ImageBitmap | undefined;

export declare function onVideoFrameUpdate(callback: (data: ImageBitmap) => void): void;
//export declare function includeUrl(url: string, context = {}, parse = (content: string) => content ): Promise<any>;

export declare function onMouseDown(callback: (e?: MouseEventMessage) => void): void;
export declare function onMouseMove(callback: (e?: MouseEventMessage) => void): void;
export declare function onMouseUp(callback: (e?: MouseEventMessage) => void): void;
export function onKeyDown(callback: (e?: KeyboardEventMessage) => void): void;
export function onKeyUp(callback: (e?: KeyboardEventMessage) => void): void;
export function onKeyPress(callback: (e?: KeyboardEventMessage) => void): void;
export function onResize(callback: (e?: ResizeEventMessage) => void): void;