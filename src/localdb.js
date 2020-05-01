import Dexie from 'dexie/dist/dexie';

class LocalDB {
    constructor() {
        this.initDb(0);
    }

    initDb(user) {
        this.db = new Dexie(user);
        this.db.version(1).stores({
            files: '++id,&[project+name],project',
            projects: '++id,&name',
        });
    }

    //------------------------------------------------------------------------------------------
    // F i l e s
    //------------------------------------------------------------------------------------------
    async createFile(name, project, content = '', lastChange = Date.now()) {
        return this.db.files.add({ project, name, content, lastChange });
    }

    async loadFile(id) {
        return this.db.files.get(id);
    }

    async loadFileByName(projectId, fileName){
        console.assert(Number.isInteger(projectId), `projectId: ${projectId}`)
        console.assert(typeof fileName === 'string', `fileName: ${fileName}`)
        return this.db.files.where({project: projectId, name: fileName}).first();
    }

    async saveFile(file, lastChange = Date.now()) {
        return this.db.files.update(file.id, {
            content: file.content,
            state: file.state,
            errors: file.errors,
            lastChange
        });
    }

    async saveFileContent(id, content, lastChange = Date.now()) {
        return this.db.files.update(id, {content, lastChange});
    }

    async saveFileState(id, state, lastChange = Date.now()) {
        return this.db.files.update(id, {state, lastChange});
    }

    async saveFileErrors(id, errors, lastChange = Date.now()){
        return this.db.files.update(id, {errors, lastChange});
    }

    async removeFile(id){
        console.log(id);
        return this.db.files.where('id').equals(id).delete();
    }

    async renameFile(id, name, lastChange = Date.now()){
        return this.db.files.update(id, {name, lastChange});
    }

    //------------------------------------------------------------------------------------------
    // P r o j e c t s
    //------------------------------------------------------------------------------------------
    async createProject(name, scenario) {
        return this.db.projects.add({ name, scenario });
    }

    async removeProject(id){
        return this.db.transaction('rw', this.db.projects, this.db.files, async () => {
            this.db.files.where('project').equals(id).delete();
            return this.db.projects.where('id').equals(id).delete();
        });
    }

    async getProjects(){
        return this.db.projects.toArray();
    }

    async getProjectByName(name){
        return this.db.projects.where({name}).first();
    }

    async getProject(id){
        return this.db.projects.where({id}).first();
    }

    async getProjectFiles(id){
        return this.db.files.where('project').equals(id).toArray();
    }

    async setProjectErrors(id, errors){
        return this.db.projects.update(id, {errors});
    }

    async importProject(name, scenario, projectFiles, globalFiles, collision){
        this.db.transaction('rw', this.db.projects, this.db.files, async () => {
            const collisionFilesPromises = globalFiles.map(newFile => new Promise((resolve, reject) => {
                this.loadFileByName(0, newFile.name).then(oldFile => {
                    resolve({oldFile, newFile})
                });
            }));

            const collisionFiles = await Promise.all(collisionFilesPromises);
            collisionFiles.forEach(cf => {
                if(cf.oldFile){
                    if(collision === 'new')
                    this.saveFile(cf.oldFile.id, cf.newFile.content);
                }
                else{
                    this.createFile(cf.newFile.name, 0, cf.newFile.content);
                }
            })

            const projectId = await this.createProject(name, scenario);
            const projectFilePromises = projectFiles.map(file => this.createFile(file.name, projectId, file.content));
            await Promise.all(projectFilePromises);

            return projectId;
        });
    }
}

export const db = new LocalDB();

export default db;