import Dexie from 'dexie';
import { editor } from 'monaco-editor';

import type { File, Project } from '@store/types';

export interface IFiles {
    id?: number,
    projectId: number,
    name: string,
    content: string,
    lastChange: number,
    state?: editor.ICodeEditorViewState,
    exports?: string,
}

export interface IProjects {
    id?: number,
    name: string,
    scenario: string,
}

class LocalDB {
    #db: Dexie;
    #files: Dexie.Table<IFiles, number>;
    #projects: Dexie.Table<IProjects, number>;

    constructor(name: string) {
        this.#db = new Dexie(name);
        this.#db.version(1).stores({
            files: '++id,&[projectId+name],projectId',
            projects: '++id,&name',
        });
        this.#files = this.#db.table('files');
        this.#projects = this.#db.table('projects');
    }

    //------------------------------------------------------------------------------------------
    // F i l e s
    //------------------------------------------------------------------------------------------
    async createFile(projectId: number, name: string, content: string = '', lastChange:number = Date.now()): Promise<number>{
        return this.#files.add({ projectId, name, content, lastChange });
    }

    async loadFile(id: number): Promise<File>{
        const iFile = await this.#files.get(id);
        if(!iFile)
            throw new LocalDBError(`file ${id} does not exist`);
        return {...iFile, id};
    }

    async loadFileByName(projectId: number, name: string): Promise<File>{
        const iFile = await this.#files.get({projectId, name});
        if(!iFile || iFile.id === undefined)
            throw new LocalDBError(`file '${name}' does not exist`);
        return {...iFile, id: iFile.id};
    }

    async saveFile(file: File, lastChange: number = Date.now()): Promise<void> {
        const records: number = await this.#files.update(file.id, {
            content: file.content,
            state: file.state,
            lastChange
        });
        if(records === 0)
            throw new LocalDBError(`could not save file ${file.id}`);
    }

    async saveFileContent(id: number, content: string, lastChange: number = Date.now()): Promise<void> {
        const records: number = await this.#files.update(id, {content, lastChange});
        if(records === 0)
            throw new LocalDBError(`could not save file ${id}`);
    }

    async saveFileState(id: number, state: any, lastChange: number = Date.now()): Promise<void> {
        const records: number = await this.#files.update(id, {state, lastChange});
        if(records === 0)
            throw new LocalDBError(`could not save file ${id}`);
    }

    async removeFile(id: number): Promise<void>{
        await this.#files.where('id').equals(id).delete();
    }

    async renameFile(id: number, name: string, lastChange: number = Date.now()): Promise<void>{
        const records: number = await this.#files.update(id, {name, lastChange});
        if(records === 0)
            throw new LocalDBError(`could not rename file ${id}`);
    }

    async fileExists(projectId:number, name: string): Promise<boolean>{
        const iFile = await this.#files.get({projectId, name});
        return iFile !== undefined;
    }

    //------------------------------------------------------------------------------------------
    // P r o j e c t s
    //------------------------------------------------------------------------------------------
    async createProject(name: string, scenario: string, files: File[] = []): Promise<number> {
        return this.#db.transaction('rw', this.#projects, this.#files, async () => {
            const projectId: number = await this.#projects.add({ name, scenario });
            const projectFilePromises = files.map(file => this.createFile(projectId, file.name, file.content));
            await Promise.all(projectFilePromises);

            return projectId;
        });
    }

    async removeProject(id: number): Promise<void>{
        await this.#db.transaction('rw', this.#projects, this.#files, async () => {
            await this.#files.where('projectId').equals(id).delete();
            await this.#projects.where('id').equals(id).delete();
        });
    }

    async getProjects(): Promise<Project[]>{
        const iProjects = await this.#projects.toArray();
        const projects: Project[] = [];
        for(const iProject of iProjects){
            if(iProject.id !== undefined){
                projects.push({...iProject, id: iProject.id})
            }
            else{
                throw new LocalDBError('this should never happen');
            }
        }
        return projects;
    }

    async getProject(id: number): Promise<Project>{
        const iProject = await this.#projects.get(id);
        if(!iProject)
            throw new LocalDBError(`project ${id} does not exist`);
        return {...iProject, id};
    }

    async getProjectByName(name: string): Promise<Project>{
        const iProject = await this.#projects.get({name});
        if(!iProject || iProject.id === undefined)
            throw new LocalDBError(`project '${name}' does not exist`);
        return {...iProject, id: iProject.id};
    }

    async getProjectFiles(id: number): Promise<File[]>{
        const iFiles = await this.#files.where('projectId').equals(id).toArray();
        const files: File[] = [];
        for(const iFile of iFiles){
            if(iFile.id !== undefined){
                files.push({...iFile, id: iFile.id})
            }
            else{
                throw new LocalDBError('this should never happen');
            }
        }
        return files;
    }

    async importProject(name: string, scenario: string, projectFiles: File[], globalFiles: File[], collision: string): Promise<number>{
        return this.#db.transaction('rw', this.#projects,this.#files, async () => {
            const collisionFilesPromises = globalFiles.map(async (newFile) => {
                try{
                    const oldFile = await this.loadFileByName(0, newFile.name);
                    if(collision === 'new')
                        await this.saveFileContent(oldFile.id, newFile.content || '');
                }
                catch(_){
                    await this.createFile(0, newFile.name, newFile.content);
                }
            });
            await Promise.all(collisionFilesPromises);

            return await this.createProject(name, scenario, projectFiles);
        });
    }

    async projectExists(name: string): Promise<boolean>{
        const project = await this.#projects.get({name});
        return project !== undefined;
    }
}

export class LocalDBError extends Error{}

export const db = new LocalDB('ai.c4f.wtf');

export default db;