import { editor } from 'monaco-editor';
export type { IPosition } from 'monaco-editor';

export type Caller = {
    fileId?: number,
    projectId?: number,
    fileName?: string,
    functionNames: string[]
    line?: number,
    column?: number,
}

export enum LogType {
    LOG,
    WARN,
    ERROR,
}

export type Log = {
    type: LogType,
    args: any[],
    caller?: Caller,
}

export type FileError = {
    caller: Caller,
    args: any[],
}

export type ProjectErrors = {
    [key:number]: FileError[],
}

export type File = {
    id: number,
    projectId: number,
    name: string,
    state?: editor.ICodeEditorViewState,
    content?: string,
    lastChange?: number,
};

export type Project = {
    id: number,
    name: string,
    scenario: string,
    errors?: ProjectErrors,
};

export type Modal = {
    template: Object,
    data: Object,
    result: any,
}