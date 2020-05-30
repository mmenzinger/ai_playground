import { observable, action, autorun, runInAction, toJS, trace } from 'mobx';
import db from '@localdb';
import { throttle } from 'lodash-es';
import settingsStore from '@store/settings-store';

import type { File, Project, ProjectSettings, ProjectErrors, Caller, Log, LogType, IPosition } from '@store/types';

class ProjectStore {
    @observable activeProject: Project | null = null;
    @observable activeFile: File | null = null;
    @observable log: Log[] = [];
    @observable lastFileTreeChange: number = 0;

    #logThrottle: () => void;
    #logQueue: Log[] = [];
    //#saveFileDebounce: (fileId: number, content: string, state: any, errors: FileError[]) => void;
    //#saveFileStateDebounce: (fileId: number, state: any) => void;


    constructor() {
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
    @action 
    async openProject(id: number) : Promise<Project> {
        let file: File | null = null;
        for(const fileName of ['readme.md', 'scenario.md', 'index.js']){
            try{
                file = await db.loadFileByName(id, fileName);
                break;
            }
            catch(_){}
        }
        const project = await db.getProject(id);
        runInAction(() => {
            this.activeFile = file;
            this.activeProject = project;
            this.lastFileTreeChange = Date.now();
        });
        return project;
    }

    @action
    async closeProject(): Promise<void> {
        this.activeProject = null;
        this.activeFile = null;
    }

    async createProject(name: string, scenario: string, files: Array<File>): Promise<number> {
        return await db.createProject(name, scenario, files);
    }

    @action
    async updateProjectSettings(id: number, settings: ProjectSettings): Promise<void> {
        await db.saveProjectSettings(id, settings)
        runInAction(() => {
            if (this.activeProject?.id === id) {
                this.activeProject.settings = settings;
            }
        });
    }

    @action
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
        return await db.importProject(name, scenario, projectFiles, globalFiles, collision);
    }

    /**********************************************************************************+
     * File 
     */
    @action
    async openFile(id: number, scrollTo?: IPosition): Promise<File> {
        if (this.activeFile) {
            await this.flushFile();
        }
        const file = await db.loadFile(id);

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

    @action
    async openVirtualFile(file: File): Promise<File> {
        if (this.activeFile) {
            await this.flushFile();
        }

        runInAction(() => {
            this.activeFile = file;
        });
        return file;
    }

    @action
    async closeFile(): Promise<void> {
        this.activeFile = null;
    }

    @action
    async createFile(name: string, projectId: number = 0, content: string = ''): Promise<number> {
        const id: number = await db.createFile(projectId, name, content);

        runInAction(() => {
            this.lastFileTreeChange = Date.now();
        });
        return id;
    }

    @action
    async deleteFile(id: number): Promise<void> {
        if (this.activeFile && this.activeFile.id === id)
            await this.closeFile();
        await db.removeFile(id);

        runInAction(() => {
            this.lastFileTreeChange = Date.now();
        });
    }

    @action
    async saveFileContent(id: number, content: string): Promise<void> {
        await db.saveFileContent(id, content);
        runInAction(() => {
            if (this.activeFile?.id === id) {
                this.activeFile.content = content;
            }
        })
    }

    @action
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

    @action
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

    @action
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

