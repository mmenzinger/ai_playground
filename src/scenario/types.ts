export interface IScenario extends HTMLElement{
    onCall: (functionName: string, args: any[]) => Promise<any>;
    getSettings: () => any;
    getFile: () => string;
    getAutorun: () => boolean;
    getExports: () => string;
}

export const utilExports = `
export async function storeJson(path: string, data: any): Promise<any>;
export async function loadJson(path: string): Promise<any>;
export async function getFileContent(path: string): Promise<string>;
export const localStorage = {
    get length(): number,
    key(n: number): string | null,
    setItem(key: string, value: any): void,
    getItem(key: string): any,
    removeItem(key: string): void,
    clear(): void,
}`;