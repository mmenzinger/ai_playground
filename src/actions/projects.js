import store from 'src/store';
import db from 'src/localdb';

import { createFile, openFile } from 'actions/files';

export const PROJECT_OPEN = 'PROJECT_OPEN';
export const PROJECT_CLOSE = 'PROJECT_CLOSE';
export const PROJECT_CREATE = 'PROJECT_CREATE';
export const PROJECT_DELETE = 'PROJECT_DELETE';

export const openProject= (id) => async dispatch => {
    const file = await db.loadFileByName(id, 'index.js');
    await store.dispatch(openFile(file.id));
    dispatch({ type: PROJECT_OPEN, id });
    return id;
}

export function closeProject() { 
    return { type: PROJECT_CLOSE };
}

export const createProject = (name, template) => async dispatch => {
    const project = await db.createProject(name);
    for(const file of template.files) {
        await store.dispatch(createFile(file.name, project, file.content));
    };
    dispatch({ type: PROJECT_CREATE, timestamp: Date.now() })
    return project;
}

export const deleteProject = (id) => async dispatch => {
    //const num = await db.removeFile(id);
    dispatch({ type: PROJECT_DELETE, timestamp: Date.now() });
    //return num;
}