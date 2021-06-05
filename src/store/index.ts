import appStore from './app-store';
import projectStore from './project-store';
import settingsStore from './settings-store';

export type { File, FileError, Project, ProjectErrors } from './project-store';

class Store{
    app = appStore;
    project = projectStore;
    settings = settingsStore;
}

export const store = new Store();
export default store;