export declare function storeJson(path: string, data: any): Promise<any>;
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
export declare const _console: Console;
export declare function getCanvas(): OffscreenCanvas;
export declare const SeedRandom: seedrandom.seedrandom_prng;
export declare function sleep(ms: number): Promise<void>