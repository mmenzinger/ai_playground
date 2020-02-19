import store from 'src/store.js';
import db from 'src/localdb.js';

import { createFile, openFile, closeFile } from 'actions/files.js';

export const PROJECT_OPEN = 'PROJECT_OPEN';
export const PROJECT_CLOSE = 'PROJECT_CLOSE';
export const PROJECT_CREATE = 'PROJECT_CREATE';
export const PROJECT_DELETE = 'PROJECT_DELETE';

export const openProject = (id) => async dispatch => {
    let file = await db.loadFileByName(id, 'readme.md');
    if(!file)
        file = await db.loadFileByName(id, 'scenario.md');
    if(!file)
        file = await db.loadFileByName(id, 'index.js');
    if(!file)
        file = {id:0};
    const project = await db.getProject(id);
    dispatch({ 
        type: PROJECT_OPEN, 
        id, 
        scenario: project.scenario || 'tictactoe', // TODO: Remove fallback
    });
    store.dispatch(openFile(file.id));
    return project;
}

export const closeProject = () => async dispatch => {
    await store.dispatch(closeFile());
    dispatch({ type: PROJECT_CLOSE });
}

export const createProject = (name, scenario, files) => async dispatch => {
    const project = await db.createProject(name, scenario);
    for(const file of files) {
        await store.dispatch(createFile(file.name, project, file.content));
    };
    dispatch({ type: PROJECT_CREATE, timestamp: Date.now() })
    return project;
}

export const deleteProject = (id) => async dispatch => {
    const num = await db.removeProject(id);
    dispatch({ type: PROJECT_DELETE, timestamp: Date.now() });
    return num === 1;
}