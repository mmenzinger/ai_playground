// @flow

export type Caller = {
    fileId: number,
    projectId: number,
    fileName: string,
    line: number,
    column: number,
}

export type Log = {
    caller?: Caller,
    args: any[],
}

export type FileError = {
    caller: Caller,
    args: any[],
}

export type ProjectErrors = {
    [id: number]: FileError[],
}

export type File = {
    id: number,
    projectId: number,
    name: string,
    content?: string,
    state?: any,
};

export type Project = {
    id: number,
    name: string,
    scenario: string,
    errors: ProjectErrors,
};

export type Modal = {
    template: Object,
    data: Object,
    result: any,
}