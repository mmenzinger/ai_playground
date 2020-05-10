// @flow
import { observable, action, flow, autorun, runInAction, toJS, trace, computed } from 'mobx';
import db from '@localdb';
import { throttle, debounce } from 'lodash-es';
import settingsStore from '@store/settings-store.js';

import type { File, Project } from '@localdb';

class ProjectStore {
    @observable activeProject: ?Project = null;
    @observable activeFile: ?File = null;
    @observable log = [];

    _logThrottle: function;
    _logQueue = [];
    _saveFileDebounce: function;
    _saveFileStateDebounce: function;


    constructor() {
        this._logThrottle = throttle(() => {
            runInAction(() => {
                const queueLength = settingsStore.get('log_queue_length', 500);
                this.log.push(...this._logQueue);
                this._logQueue = [];
                if (this.log.length > queueLength)
                    this.log.splice(0, this.log.length - queueLength);
            });
        }, 100);

        this._saveFileDebounce = debounce((fileId, content, state, errors) => {
            db.saveFileContent(fileId, content);
        }, 1000);
        this._saveFileStateDebounce = debounce((fileId, state) => {
            //db.saveFile(fileId, state);
        }, 100);
    }

    /**********************************************************************************+
     * Project 
     */
    // return type should be Promise<Project>, but can't infer in app-store
    // TODO: find problem and set return type to Promise<Project>
    @action 
    openProject: /*fixme*/any/*fixme*/ = flow(function* (id: number) {
        let file: ?File = null;
        for(const fileName of ['readme.md', 'scenario.md', 'index.js']){
            try{
                file = yield db.loadFileByName(id, fileName);
                break;
            }
            catch(e){}
        }
        const project: Project = yield db.getProject(id);
        project.errors = {};
        const files = yield db.getProjectFiles(id);
        files.push(...yield db.getProjectFiles(0));
        for (const file of files) {
            if (file.errors && file.errors.length > 0 && project)
                project.errors[file.id] = {
                    fileId: file.id,
                    fileName: file.name,
                    project: file.project,
                    errors: file.errors,
                };
        }
        this.activeFile = file;
        this.activeProject = project;
        return this.activeProject;
    })

    @action
    async closeProject(): Promise<void> {
        this.activeProject = null;
        this.activeFile = null;
    }

    async createProject(name: string, scenario: string, files: Array<File>): Promise<number> {
        return await db.createProject(name, scenario, files);
    }

    updateProjectErrors: Promise<void> = flow(function* (id, fileErrorsList) {
        let errors = {};
        if (this.activeProject?.id === id) {
            errors = toJS(this.activeProject.errors) || {};
        }
        else {
            const project = yield db.getProject(id);
            errors = project.errors || {};
        }
        for (const fileErrors of fileErrorsList) {
            if (fileErrors.errors.length > 0) {
                errors[fileErrors.fileId] = fileErrors.errors;
            }
            else {
                delete errors[fileErrors.fileId];
            }
        }
        if (this.activeProject?.id === id) {
            this.activeProject.errors = errors;
        }
        yield db.setProjectErrors(id, errors);
    })

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
    openFile: Promise<File> = flow(function* (id, state = undefined) {
        if (this.activeFile) {
            yield this.flushFile();
        }
        this.activeFile = yield db.loadFile(id);
        return this.activeFile;
    })

    @action
    async closeFile(): Promise<void> {
        this.activeFile = null;
    }

    async createFile(name: string, projectId: number = 0, content: string = ''): Promise<number> {
        const id: number = await db.createFile(projectId, name, content);
        return id;
    }

    deleteFile: Promise<void> = flow(function* (id) {
        if (this.activeFile && this.activeFile.id === id)
            yield this.closeFile();
        yield db.removeFile(id);
    })

    @action
    async saveFileContent(id: number, content: string): Promise<void> {
        if (this.activeFile && this.activeFile.id === id) {
            this.activeFile.content = content;
        }
        await db.saveFileContent(id, content);
    }

    @action
    async saveFileState(id: number, state: any): Promise<void> {
        if (this.activeFile && this.activeFile.id === id) {
            this.activeFile.state = state;
        }
        await db.saveFileState(id, state);
    }

    async flushFile(): Promise<void> {
        this._saveFileDebounce.flush();
    }

    renameFile: Promise<void> = flow(function* (id, name) {
        if (this.activeFile && this.activeFile.id === id)
            this.activeFile.name = name;
        yield db.renameFile(id, name);
    })


    /**********************************************************************************+
     * Log 
     */
    addLog: Promise<void> = flow(function* (type, args, caller = null) {
        if (caller && !caller.fileId && this.activeProject) {
            const projectId = caller.project === 'project' ? this.activeProject.id : 0;
            const file = yield db.loadFileByName(projectId, caller.fileName);
            caller.fileId = file.id;
        }
        this._logQueue.push({ type, args, caller });
        this._logThrottle();
    })

    @action
    async clearLog(): Promise<void> {
        this.log = [];
    }
}


export const projectStore = new ProjectStore();

export function debugProjectStore() {
    autorun(reaction => {
        trace();
        console.log('---- projectStore update ----', toJS(projectStore));
    });
}

export default projectStore;

