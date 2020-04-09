import db from 'src/localdb.js';

export const FILE_OPEN = 'FILE_OPEN';
export const FILE_CLOSE = 'FILE_CLOSE';
export const FILE_CREATE = 'FILE_CREATE';
export const FILE_SAVE = 'FILE_SAVE';
export const FILE_DELETE = 'FILE_DELETE';
export const FILE_MOVE = 'FILE_MOVE';
export const FILE_RENAME = 'FILE_RENAME';

export const openFile = (id, state = undefined) => async dispatch => {
    const file = await db.loadFile(id);
    if(state) // TODO: better merging
        file.state = state;
    dispatch({ type: FILE_OPEN, file });
}

export function closeFile() { 
    return { type: FILE_CLOSE };
}

export const createFile = (name, project = 0, content = '') => async dispatch => {
    const timestamp = Date.now();
    const id = await db.createFile(name, project, content, timestamp);
    dispatch({ type: FILE_CREATE, timestamp });
    return id;
}

export const deleteFile = (id) => async dispatch => {
    const timestamp = Date.now();
    const num = await db.removeFile(id);
    dispatch({ type: FILE_DELETE, timestamp });
    return num;
}

export const saveFile = (id, content) => async dispatch => {
    const timestamp = Date.now();
    const num = await db.saveFile(id, content, timestamp);
    dispatch({ type: FILE_SAVE, content, timestamp });
    return num;
}

export const renameFile = () => async dispatch => {
    const timestamp = Date.now();
    throw Error('not implemented');
    return { type: FILE_RENAME, timestamp };
}