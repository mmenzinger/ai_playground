import db from 'src/localdb';

export const FILE_OPEN = 'FILE_OPEN';
export const FILE_CLOSE = 'FILE_CLOSE';
export const FILE_CREATE = 'FILE_CREATE';
export const FILE_SAVE = 'FILE_SAVE';
export const FILE_DELETE = 'FILE_DELETE';
export const FILE_MOVE = 'FILE_MOVE';
export const FILE_RENAME = 'FILE_RENAME';

export function openFile(id) { 
    return { type: FILE_OPEN, id };
}

export function closeFile() { 
    return { type: FILE_CLOSE };
}

export const createFile = (name, project = 0, content = '') => async dispatch => {
    const id = await db.createFile(name, project, content);
    dispatch({ type: FILE_CREATE, id, timestamp: Date.now() })
    return id;
}

export const deleteFile = (id) => async dispatch => {
    const num = await db.removeFile(id);
    dispatch({ type: FILE_DELETE, id, timestamp: Date.now() });
    return num;
}

export const saveFile = (id, content) => async dispatch => {
    const num = await db.saveFile(id, content);
    dispatch({ type: FILE_SAVE, id, timestamp: Date.now() });
    return num;
}

export const renameFile = () => async dispatch => { 
    throw Error('not implemented');
    return { type: FILE_RENAME, timestamp: Date.now() };
}