import { observable, action, makeObservable, autorun, runInAction, toJS, trace } from 'mobx';
import db from '@localdb';
import { throttle } from 'lodash-es';
import settingsStore from '@store/settings-store';

import type { Caller, Log, LogType, IPosition } from '@store/types';
import { editor } from 'monaco-editor';

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
    parentId: number,
    name: string,
    state?: editor.ICodeEditorViewState,
    content?: string | Blob,
    lastChange?: number,
    virtual?: boolean,
};

export type Project = {
    id: number,
    name: string,
    scenario: string,
    openFileId?: number,
    errors?: ProjectErrors,
};

class ProjectStore {
    activeProject: Project | null = null;
    activeFile: File | null = null;
    log: Log[] = [];
    lastFileTreeChange: number = 0;

    #logThrottle: () => void;
    #logQueue: Log[] = [];
    //#saveFileDebounce: (fileId: number, content: string, state: any, errors: FileError[]) => void;
    //#saveFileStateDebounce: (fileId: number, state: any) => void;

    constructor() {
        makeObservable(this, {
            activeProject: observable,
            activeFile: observable,
            log: observable,
            lastFileTreeChange: observable,
            openProject: action,
            closeProject: action,
            updateProjectErrors: action,
            openFile: action,
            openVirtualFile: action,
            closeFile: action,
            createFile: action,
            deleteFile: action,
            saveFileContent: action,
            saveFileState: action,
            renameFile: action,
            clearLog: action,
        });

        this.#logThrottle = throttle(() => {
            const queueLength = settingsStore.get('log_queue_length', 500);
            runInAction(() => {
                this.log.push(...this.#logQueue);
                if (this.log.length > queueLength)
                    this.log.splice(0, this.log.length - queueLength);
            });
            this.#logQueue = [];
        }, 100);

        //this.#saveFileDebounce = debounce((fileId, content, state, errors) => {
        //    db.saveFileContent(fileId, content);
        //}, 1000);
        //this.#saveFileStateDebounce = debounce((fileId, state) => {
        //    //db.saveFile(fileId, state);
        //}, 100);
    }

    /**********************************************************************************+
     * Project 
     */
    async openProject(id: number) : Promise<Project> {
        const project = await db.getProject(id);
        let file: File | null = null;
        if(project.openFileId){
            try{
                file = await db.loadFile(project.openFileId);
            }
            catch(_){}
        }
        if(!file){
            for(const fileName of ['readme.md', 'scenario.md', 'index.js']){
                try{
                    file = await db.loadFileByName(id, fileName);
                    break;
                }
                catch(_){}
            }
        }
        runInAction(() => {
            this.activeFile = file;
            this.activeProject = project;
            this.lastFileTreeChange = Date.now();
        });
        
        return project;
    }

    async closeProject(): Promise<void> {
        this.activeProject = null;
        this.activeFile = null;
    }

    async createProject(name: string, scenario: string, files: Array<File>): Promise<number> {
        return db.createProject(name, scenario, files);
    }

    async updateProjectErrors(id: number, projectErrors: ProjectErrors): Promise<void> {
        let errors: ProjectErrors = {};
        if (this.activeProject && this.activeProject.id === id && this.activeProject.errors) {
            errors = toJS(this.activeProject.errors);
        }
        else {
            const project = await db.getProject(id);
            errors = project.errors || errors;
        }
        for (const [fileId, fileErrors] of Object.entries(projectErrors)) {
            if (fileErrors.length > 0) {
                errors[Number(fileId)] = fileErrors;
            }
            else {
                delete errors[Number(fileId)];
            }
        }

        runInAction(() => {
            if (this.activeProject?.id === id) {
                this.activeProject.errors = errors;
            }
        });
    }

    async deleteProject(id: number): Promise<void> {
        if (this.activeProject && this.activeProject.id === id)
            await this.closeProject();
        await db.removeProject(id);
    }

    async importProject(name: string, scenario: string, projectFiles: Array<File>, globalFiles: Array<File>, collision: string): Promise<number> {
        return db.importProject(name, scenario, projectFiles, globalFiles, collision);
    }

    async getProjectFiles(id: number): Promise<File[]>{
        return db.getProjectFiles(id);
    }

    /**********************************************************************************+
     * File 
     */
    async openFile(id: number, scrollTo?: IPosition): Promise<File> {
        if (this.activeFile) {
            await this.flushFile();
        }
        const file = await db.loadFile(id);
        if(this.activeProject && this.activeFile?.id !== id ){
            db.setProjectOpenFileId(this.activeProject.id, id);
        }
        

        if(scrollTo && file.state){
            file.state.cursorState = [{
                inSelectionMode: false,
                position: scrollTo,
                selectionStart: scrollTo,
            }];
            file.state.viewState = {
                firstPosition: scrollTo,
                scrollLeft: 0,
                firstPositionDeltaTop: 0,
            };
        }

        runInAction(() => {
            this.activeFile = file;
        });
        return file;
    }

    async openVirtualFile(file: File): Promise<File> {
        if (this.activeFile) {
            await this.flushFile();
        }

        runInAction(() => {
            this.activeFile = file;
        });
        return file;
    }

    async closeFile(): Promise<void> {
        this.activeFile = null;
    }

    async createFile(name: string, projectId: number = 0, parentId: number = 0, content: string | Blob = ''): Promise<number> {
        const id: number = await db.createFile(projectId, parentId, name, content);

        runInAction(() => {
            this.lastFileTreeChange = Date.now();
        });
        return id;
    }

    async deleteFile(id: number): Promise<void> {
        if (this.activeFile && this.activeFile.id === id)
            await this.closeFile();
        await db.removeFile(id);

        runInAction(() => {
            this.lastFileTreeChange = Date.now();
        });
    }

    async saveFileContent(id: number, content: string): Promise<void> {
        await db.saveFileContent(id, content);
        runInAction(() => {
            if (this.activeFile?.id === id) {
                this.activeFile.content = content;
            }
        })
    }

    async saveFileState(id: number, state: any): Promise<void> {
        await db.saveFileState(id, state);
        runInAction(() => {
            if (this.activeFile?.id === id) {
                this.activeFile.state = state;
            }
        });
    }

    async flushFile(): Promise<void> {
        //this.#saveFileDebounce.flush();
    }

    async renameFile(id: number, name: string): Promise<void> {
        await db.renameFile(id, name);
        runInAction(() => {
            if (this.activeFile?.id === id)
            this.activeFile.name = name;
            this.lastFileTreeChange = Date.now();
        });
    }


    /**********************************************************************************+
     * Log 
     */
    async addLog(type: LogType, args: any[], caller?: Caller): Promise<void> {
        if (caller) {
            try{
                if(!caller.fileId){
                    if(caller.projectId && caller.fileName){
                        const file = await db.loadFileByName(caller.projectId, caller.fileName);
                        caller.fileId = file.id;
                    }
                }
                if(!caller.projectId || !caller.fileName){
                    if(caller.fileId){
                        const file = await db.loadFile(caller.fileId);
                        caller.projectId = file.projectId;
                        caller.fileName = file.name;
                    }
                }
            }
            catch(error){
                console.warn(error);
            }
        }
        this.#logQueue.push({ type, args, caller });
        this.#logThrottle();
    }

    async clearLog(): Promise<void> {
        this.log = [];
    }
}


export const projectStore = new ProjectStore();

export function debugProjectStore() {
    autorun(_ => {
        trace();
        console.log('---- projectStore update ----', toJS(projectStore));
    });
}

export default projectStore;

