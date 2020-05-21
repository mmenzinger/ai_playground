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