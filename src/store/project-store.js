import { observable, action, decorate, autorun } from 'mobx';
import db from 'src/localdb.js';
import { throttle } from 'lodash';
import { debounce } from 'lodash';

class ProjectStore{
    constructor(){
        this.activeProject = null;
        this.activeFile = null;
        this.log = [];

        this._logThrottle = throttle(() => {
            this.log.push(...this._logQueue);
            console.log(this._logQueue)
            this._logQueue = [];
            if(this.log.length > 10)
                this.log.splice(0, this.log.length-10);
        }, 100);
        this._logQueue = [];

        this._saveFileDebounce = debounce((fileId, content) => {
            db.saveFile(fileId, content);
        }, 1000);
    }

    async openProject(id) {
        let file = await db.loadFileByName(id, 'readme.md');
        if(!file)
            file = await db.loadFileByName(id, 'scenario.md');
        if(!file)
            file = await db.loadFileByName(id, 'index.js');
        if(!file)
            file = {id:0};
        this.activeFile = await this.openFile(file.id);
        this.activeProject = await db.getProject(id);
    }
    
    async closeProject() {
        this.activeProject = null;
        this.activeFile = null;
    }
    
    async createProject(name, scenario, files) {
        const projectId = await db.createProject(name, scenario);
        for(const file of files) {
            await this.createFile(file.name, projectId, file.content);
        };
        return projectId;
    }
    
    async deleteProject(id) {
        if(this.activeProject && this.activeProject.id === id)
            await this.closeProject();
        await db.removeProject(id);
    }
    
    async importProject(name, scenario, projectFiles, globalFiles, collision) {
        const projectId = await db.importProject(name, scenario, projectFiles, globalFiles, collision);
        return projectId;
    }

    async openFile(id, state = undefined) {
        this.activeFile = await db.loadFile(id);
        this.activeFile.state = state;
        return this.activeFile;
    }
    
    async closeFile() {
        this.activeFile = null;
    }
    
    async createFile(name, project = 0, content = '') {
        const id = await db.createFile(name, project, content);
        return id;
    }
    
    async deleteFile(id) {
        if(this.activeFile && this.activeFile.id === id)
            await this.closeFile();
        await db.removeFile(id);
    }
    
    async saveFile(id, content) {
        if(this.activeFile && this.activeFile.id === id)
            this.activeFile.content = content;
        this._saveFileDebounce(id, content);
    }

    async flushActiveFile(){
        this._saveFileDebounce.flush();
    }
    
    async setFileErrors(id, errors) {
        if(this.activeFile && this.activeFile.id === id)
            this.activeFile.errors = errors;
        await db.setFileErrors(id, errors);
    }
    
    async renameFile(id, name) {
        if(this.activeFile && this.activeFile.id === id)
            this.activeFile.name = name;
        await db.renameFile(id, name);
    }

    async addLog(type, args, caller = null) {
        const projectId = caller.project === 'project' ? projectStore.activeProject.id : 0;
        const file = await db.loadFileByName(projectId, caller.fileName);
        caller.fileId = file.id;
        this._logQueue.push({type, args, caller});
        this._logThrottle();
    }
    
    async clearLog() {
        this.log = [];
    }
}

decorate(ProjectStore, {
    activeProject: observable,
    activeFile: observable,
    log: observable,

    openProject: action,
    closeProject: action,
    createProject: action,
    deleteProject: action,
    importProject: action,

    openFile: action,
    closeFile: action,
    createFile: action,
    deleteFile: action,
    saveFile: action,
    setFileErrors: action,
    renameFile: action,

    addLog: action,
    clearLog: action,
});

export const projectStore = new ProjectStore();

export function debugProjectStore(){
    autorun(reaction => {
        console.log('---- projectStore update ----', JSON.parse(JSON.stringify(projectStore)));
    });
}

export default projectStore;

