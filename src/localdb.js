import Dexie from 'dexie/dist/dexie';

class LocalDB {
    constructor() {
        this.initDb(0);
    }

    initDb(user) {
        this.db = new Dexie(user);
        this.db.version(1).stores({
            states: '',
            files: '++id,&[project+name],project',
            projects: '++id,&name',
        });
    }

    //------------------------------------------------------------------------------------------
    // F i l e s
    //------------------------------------------------------------------------------------------
    async createFile(name, project, content = '') {
        return this.db.files.add({ project, name, content });
    }

    async loadFile(id) {
        return this.db.files.get(id);
    }

    async saveFile(id, content) {
        return this.db.files.update(id, {content});
    }

    async removeFile(id){
        return this.db.files.where('id').equals(id).delete();
    }

    async getProjectFiles(project){
        return this.db.files.where('project').equals(project).toArray();
    }

    async loadFileByName(projectId, fileName){
        //let projectId = 0;
        /*if(path === 'project'){
            const app = await this.db.states.get('app');
            projectId = app.currentProject;
        }*/
        return this.db.files.where({project: projectId, name: fileName}).first();
    }

    //------------------------------------------------------------------------------------------
    // P r o j e c t s
    //------------------------------------------------------------------------------------------
    async createProject(name) {
        return this.db.projects.add({ name });
    }

    async removeProject(id){
        return this.transaction('w', this.db.projects, this.db.files, async () => {
            this.db.files.where('project').equals(id).delete();
            return this.db.files.where('id').equals(id).delete();
        });
    }

    async getProjects(){
        return this.db.projects.toArray();
    }

    async getProjectByName(name){
        return this.db.projects.where({name}).first();
    }

    //------------------------------------------------------------------------------------------
    // S t a t e
    //------------------------------------------------------------------------------------------
    /*async saveState(state){
        return this.db.states.bulkPut([state.app, state.files], ['app', 'files']);
    }

    async getState(){
        return {
            app: await this.db.states.get('app'),
            files: await this.db.states.get('files'),
        };
    }*/
}

export const db = new LocalDB();

export default db;