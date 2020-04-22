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
        return this.db.files.where({project: projectId, name: fileName}).first();
    }

    async saveFile(id, content, lastChange = Date.now()) {
        return this.db.files.update(id, {content, lastChange});
    }

    async removeFile(id){
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

    async getProjectFiles(project){
        return this.db.files.where('project').equals(project).toArray();
    }

    async importProject(name, scenario, projectFiles, globalFiles, collision){
        return this.db.transaction('rw', this.db.projects, this.db.files, async () => {
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
        });
    }
}

export const db = new LocalDB();

export default db;