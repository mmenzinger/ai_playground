import Dexie from 'dexie';
import { editor } from 'monaco-editor';

import type { File, Project } from '@store';
import { BasicFile } from './webpack-utils';

export interface IFiles {
    id?: number,
    projectId: number,
    parentId: number,
    name: string,
    path: string,
    content?: string | Blob,
    lastChange?: number,
    state?: editor.ICodeEditorViewState,
}

export interface IProjects {
    id?: number,
    name: string,
    scenario: string,
    openFileId?: number,
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
        // TODO: merge version 2, 3, 4 and 5 into 2
        this.#db.version(2).stores({
            files: '++id,&[projectId+name],projectId,parentId',
        });
        this.#db.version(3).upgrade(trans => {
            return trans.table('files').toCollection().modify((file:File) => {
                file.parentId = 0;
            });
        });
        this.#db.version(4).stores({
            files: '++id,&[projectId+parentId+name],projectId,parentId',
        });
        this.#db.version(5).stores({
            files: '++id,&[projectId+parentId+name],[projectId+name],projectId,parentId',
        });
        this.#db.version(6).stores({
            files: '++id,&[projectId+parentId+name],&[projectId+path],[projectId+name],projectId,parentId',
        }).upgrade(trans => {
            return trans.table('files').toCollection().modify((file:File) => {
                file.path = file.name;
            });
        });
        this.#files = this.#db.table('files');
        this.#projects = this.#db.table('projects');
    }

    //------------------------------------------------------------------------------------------
    // F i l e s
    //------------------------------------------------------------------------------------------
    async createFile(projectId: number, name: string, content?: string | Blob, parentId?: number): Promise<number>{
        const lastChange = Date.now();
        let path = name;
        if(parentId === 0 && ['first', 'file'].includes(name)){
            throw new LocalDBError(`'${name}' is used internally and can not be used as a top level name`);
        }
        if(parentId === undefined){
            parentId = 0;
        }
        if(parentId !== 0){
            let parent = parentId;
            while(parent !== 0){
                const iFile: IFiles | undefined = await this.#files.get({id: parent});
                if(!iFile){
                    break;
                }
                parent = iFile.parentId || 0;
                path = `${iFile.name}/${path}`;
            }
        }
        return this.#files.add({ projectId, name, path, content, parentId, lastChange });
    }

    async loadFile(id: number): Promise<File>{
        const iFile = await this.#files.get(id);
        if(!iFile)
            throw new LocalDBError(`file ${id} does not exist`);
        return {...iFile, id};
    }

    async loadFileByPath(projectId: number, path: string): Promise<File>{
        const iFile = await this.#files.get({projectId, path});
        if(!iFile)
            throw new LocalDBError(`file '${path}' does not exist`);
        return iFile as File;
    }

    async loadFirstFileByName(projectId: number, name: string): Promise<File>{
        let iFile = await this.#files.get({projectId, name});
        if(!iFile)
            throw new LocalDBError(`file '${name}' does not exist`);
        return iFile as File;
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

    async saveFileContent(id: number, content: string | Blob, lastChange: number = Date.now()): Promise<void> {
        const records: number = await this.#files.update(id, {content, lastChange});
        if(records === 0){
            // TODO: remove debug output
            console.error(`could not save file ${id}`, {content, lastChange});
            throw new LocalDBError(`could not save file ${id}`);
        }
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
        const iFile = await this.#files.get(id);
        if(!iFile)
            throw new LocalDBError(`file ${id} does not exist`);
        const path = iFile.path.split('/');
        path.pop();
        path.push(name);
        const records: number = await this.#files.update(id, {name, path: path.join('/'), lastChange});
        if(records === 0)
            throw new LocalDBError(`could not rename file ${id}`);
    }

    async moveFile(id: number, parentId: number, lastChange: number = Date.now()): Promise<void>{
        const iFile = await this.#files.get(id);
        if(!iFile)
            throw new LocalDBError(`file ${id} does not exist`);
        let parent = parentId;
        let path = iFile.name;
        while(parent !== 0){
            const iFile: IFiles | undefined = await this.#files.get({id: parent});
            if(!iFile){
                break;
            }
            parent = iFile.parentId || 0;
            path = `${iFile.name}/${path}`;
        }
        const records: number = await this.#files.update(id, {parentId, path, lastChange});
        if(records === 0)
            throw new LocalDBError(`could not move file ${id} into ${parentId}`);
    }

    async fileExists(projectId:number, name: string): Promise<boolean>{
        const iFile = await this.#files.get({projectId, name});
        return iFile !== undefined;
    }

    //------------------------------------------------------------------------------------------
    // P r o j e c t s
    //------------------------------------------------------------------------------------------
    async createProject(name: string, scenario: string, files: BasicFile[] = []): Promise<number> {
        return this.#db.transaction('rw', this.#projects, this.#files, async () => {
            const projectId: number = await this.#projects.add({ name, scenario });
            let projectFilePromises: Promise<number>[] = [];
            const recAddFile = async (file: BasicFile, parentId: number = 0) => {
                if(Array.isArray(file.content)){
                    const newFileId = await this.createFile(projectId, file.name, undefined, parentId);
                    file.content.forEach(file => recAddFile(file, newFileId));
                }
                else{
                    projectFilePromises.push(this.createFile(projectId, file.name, file.content, parentId));
                }
            }
            files.forEach((file) => recAddFile(file));
            
            // const projectFilePromises = files.map(file => this.createFile(projectId, file.parentId, file.name, file.content));
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

    async getProjectFilesResolved(id: number): Promise<File[]>{
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

    async setProjectOpenFileId(id: number, fileId: number): Promise<void> {
        await this.#projects.update(id, {openFileId: fileId});
    }

    async importProject(name: string, scenario: string, projectFiles: File[], globalFiles: File[], collision: string): Promise<number>{
        return this.#db.transaction('rw', this.#projects,this.#files, async () => {
            const collisionFilesPromises = globalFiles.map(async (newFile) => {
                try{
                    const oldFile = await this.loadFileByPath(0, newFile.name);
                    if(collision === 'new')
                        await this.saveFileContent(oldFile.id, newFile.content || '');
                }
                catch(_){
                    await this.createFile(0, newFile.name, newFile.content, newFile.parentId);
                }
            });
            await Promise.all(collisionFilesPromises);

            return await this.createProject(name, scenario, projectFiles as BasicFile[]);
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