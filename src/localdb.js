// @flow
import Dexie from 'dexie';


class LocalDB {
    db: any;

    constructor(name: string) {
        this.db = new Dexie(name);
        this.db.version(1).stores({
            files: '++id,&[projectId+name],projectId',
            projects: '++id,&name',
        });
    }

    //------------------------------------------------------------------------------------------
    // F i l e s
    //------------------------------------------------------------------------------------------
    async createFile(projectId: number, name: string, content: string = '', lastChange:number = Date.now()): Promise<number>{
        return this.db.files.add({ projectId, name, content, lastChange });
    }

    async loadFile(id: number): Promise<File>{
        const file: ?File = await this.db.files.get(id);
        if(!file)
            throw new LocalDBError(`file ${id} does not exist`);
        return file;
    }

    async loadFileByName(projectId: number, name: string): Promise<File>{
        const file: ?File = await this.db.files.get({projectId, name});
        if(!file)
            throw new LocalDBError(`file '${name}' does not exist`);
        return file;
    }

    async saveFile(file: File, lastChange: number = Date.now()): Promise<void> {
        const records: number = await this.db.files.update(file.id, {
            content: file.content,
            state: file.state,
            lastChange
        });
        if(records === 0)
            throw new LocalDBError(`could not save file ${file.id}`);
    }

    async saveFileContent(id: number, content: string, lastChange: number = Date.now()): Promise<void> {
        const records: number = await this.db.files.update(id, {content, lastChange});
        if(records === 0)
            throw new LocalDBError(`could not save file ${id}`);
    }

    async saveFileState(id: number, state: any, lastChange: number = Date.now()): Promise<void> {
        const records: number = await this.db.files.update(id, {state, lastChange});
        if(records === 0)
            throw new LocalDBError(`could not save file ${id}`);
    }

    async removeFile(id: number): Promise<void>{
        await this.db.files.where('id').equals(id).delete();
    }

    async renameFile(id: number, name: string, lastChange: number = Date.now()): Promise<void>{
        const records: number = await this.db.files.update(id, {name, lastChange});
        if(records === 0)
            throw new LocalDBError(`could not rename file ${id}`);
    }

    async fileExists(projectId:number, name: string): Promise<boolean>{
        const file: ?File = await this.db.files.get({projectId, name});
        return file !== undefined;
    }

    //------------------------------------------------------------------------------------------
    // P r o j e c t s
    //------------------------------------------------------------------------------------------
    async createProject(name: string, scenario: string, files: File[] = []): Promise<number> {
        return this.db.transaction('rw', this.db.projects, this.db.files, async () => {
            const projectId: number = await this.db.projects.add({ name, scenario });
            const projectFilePromises = files.map(file => this.createFile(projectId, file.name, file.content));
            await Promise.all(projectFilePromises);

            return projectId;
        });
    }

    async removeProject(id: number): Promise<void>{
        await this.db.transaction('rw', this.db.projects, this.db.files, async () => {
            await this.db.files.where('projectId').equals(id).delete();
            await this.db.projects.where('id').equals(id).delete();
        });
    }

    async getProjects(): Promise<Project[]>{
        return this.db.projects.toArray();
    }

    async getProject(id: number): Promise<Project>{
        const project: ?Project = await this.db.projects.get(id);
        if(!project)
            throw new LocalDBError(`project ${id} does not exist`);
        return project;
    }

    async getProjectByName(name: string): Promise<Project>{
        const project: ?Project = await this.db.projects.get({name});
        if(!project)
            throw new LocalDBError(`project '${name}' does not exist`);
        return project;
    }

    async getProjectFiles(id: number): Promise<File[]>{
        return this.db.files.where('projectId').equals(id).toArray();
    }

    async setProjectErrors(id: number, errors: any[]): Promise<void>{
        const records: number = await this.db.projects.update(id, {errors});
        if(records === 0)
            throw new LocalDBError(`could not update errors of project ${id}`);
    }

    async importProject(name: string, scenario: string, projectFiles: File[], globalFiles: File[], collision: string): Promise<number>{
        return this.db.transaction('rw', this.db.projects, this.db.files, async () => {
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
        const project: ?Project = await this.db.projects.get({name});
        return project !== undefined;
    }
}

export class LocalDBError extends Error{}

export type Caller = {
    projectId: number,
    fileId: number,
    fileName: string,
    line: number,
    column: number,
}

export type Log = {
    caller?: Caller,
    args: any[],
}

export type FileError = Log & {
    caller: Caller,
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
    errors: { [key: string]: FileError },
};

export const db = new LocalDB('ai.c4f.wtf');

export default db;