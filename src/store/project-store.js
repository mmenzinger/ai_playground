import { observable, action, flow, autorun, runInAction, toJS, trace, computed } from 'mobx';
import db from 'src/localdb.js';
import { throttle, debounce } from 'lodash-es';
import settingsStore from 'store/settings-store.js';

class ProjectStore {
    @observable activeProject = null;
    @observable activeFile = null;
    @observable log = [];

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
        this._logQueue = [];

        this._saveFileDebounce = debounce((fileId, content, state, errors) => {
            db.saveFile(fileId, content, state, errors);
        }, 1000);
        this._saveFileStateDebounce = debounce((fileId, state) => {
            //db.saveFile(fileId, state);
        }, 100);
    }

    /**********************************************************************************+
     * Project 
     */
    @action
    async openProject(id) {
        let file = await db.loadFileByName(id, 'readme.md');
        if (!file)
            file = await db.loadFileByName(id, 'scenario.md');
        if (!file)
            file = await db.loadFileByName(id, 'index.js');
        if (!file)
            file = { id: 0 };
        this.activeFile = await this.openFile(file.id);
        this.activeProject = await db.getProject(id);
        this.activeProject.errors = {};
        const files = await db.getProjectFiles(id);
        files.push(...await db.getProjectFiles(0));
        for(const file of files){
            if(file.errors && file.errors.length > 0)
                this.activeProject.errors[file.id] = {
                    fileId: file.id,
                    fileName: file.name,
                    project: file.project,
                    errors: file.errors,
                };
        }
    }

    @action
    async closeProject() {
        this.activeProject = null;
        this.activeFile = null;
    }

    async createProject(name, scenario, files) {
        const projectId = await db.createProject(name, scenario);
        for (const file of files) {
            await this.createFile(file.name, projectId, file.content);
        };
        return projectId;
    }

    updateProjectErrors = flow(function*(id, fileErrorsList){
        let errors = {};
        if(this.activeProject?.id === id){
            errors = toJS(this.activeProject.errors) || {};
        }
        else{
            const project = yield db.getProject(id);
            errors = project.errors || {};
        }
        for(const fileErrors of fileErrorsList){
            if(fileErrors.errors.length > 0){
                errors[fileErrors.fileId] = fileErrors.errors;
            }
            else{
                delete errors[fileErrors.fileId];
            }
        }
        if(this.activeProject?.id === id){
            this.activeProject.errors = errors;
        }
        yield db.setProjectErrors(id, errors);
    })

    async deleteProject(id) {
        if (this.activeProject && this.activeProject.id === id)
            await this.closeProject();
        await db.removeProject(id);
    }

    async importProject(name, scenario, projectFiles, globalFiles, collision) {
        const projectId = await db.importProject(name, scenario, projectFiles, globalFiles, collision);
        return projectId;
    }

    /*@computed
    get activeErrors(){
        let errors = null;
        if(this.activeProject && this.activeProject.errors && Object.keys(this.activeProject.errors).length > 0){
            errors = [];
            console.log(toJS(this.activeProject.errors))
            for(const fileErrors of Object.values(this.activeProject.errors)){
                for(const error of fileErrors.errors){
                    errors.push({
                        type: 'error',
                        args: [error.message],
                        caller: {
                            fileId: fileErrors.fileId,
                            project: fileErrors.project === 0 ? 0 : 'project',
                            fileName: fileErrors.fileName,
                            functionName: null,
                            lineNumber: error.line,
                            columnNumber: error.column,
                        },
                    });
                }
            }
        }
        return errors;
    }*/

    /**********************************************************************************+
     * File 
     */
    openFile = flow(function*(id, state = undefined) {
        if(this.activeFile){
            yield this.flushFile();
        }
        this.activeFile = yield db.loadFile(id);
        return this.activeFile;
    })

    @action
    async closeFile() {
        this.activeFile = null;
    }

    async createFile(name, project = 0, content = '') {
        const id = await db.createFile(name, project, content);
        return id;
    }

    deleteFile = flow(function*(id) {
        if (this.activeFile && this.activeFile.id === id)
            yield this.closeFile();
        yield db.removeFile(id);
    })

    @action
    async saveFileContent(id, content) {
        if (this.activeFile && this.activeFile.id === id){
            this.activeFile.content = content;
        }
        await db.saveFileContent(id, content);
    }

    @action
    async saveFileState(id, state) {
        if (this.activeFile && this.activeFile.id === id){
            this.activeFile.state = state;
        }
        await db.saveFileState(id, state);
    }

    @action
    async saveFileErrors(id, errors) {
        if (this.activeFile && this.activeFile.id === id){
            this.activeFile.errors = errors;
        }
        db.saveFileErrors(id, errors);
    }

    /*setFileErrors = flow(function*(fileErrorsList) {
        console.log(fileErrorsList);
        if(this.activeProject){
            for(const fileErrors of fileErrorsList){
                const fileId = fileErrors.fileId;
                const errors = fileErrors.errors;
                if (this.activeFile && this.activeFile.id === fileId)
                    this.activeFile.errors = errors;
                
                yield db.setFileErrors(fileId, errors);
                if(errors.length > 0){
                    this.activeProject.errors[fileId] = fileErrors;
                }
                else{
                    delete this.activeProject.errors[fileId];
                }
            }
        }
    })*/

    async flushFile() {
        this._saveFileDebounce.flush();
    }

    renameFile = flow(function*(id, name) {
        if (this.activeFile && this.activeFile.id === id)
            this.activeFile.name = name;
        yield db.renameFile(id, name);
    })


    /**********************************************************************************+
     * Log 
     */
    addLog = flow(function*(type, args, caller = null) {
        if(caller && !caller.fileId){
            const projectId = caller.project === 'project' ? projectStore.activeProject.id : 0;
            const file = yield db.loadFileByName(projectId, caller.fileName);
            caller.fileId = file.id;
        }
        this._logQueue.push({ type, args, caller });
        this._logThrottle();
    })

    @action
    async clearLog() {
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

