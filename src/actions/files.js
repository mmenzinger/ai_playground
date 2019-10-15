export const FILE_OPEN = 'FILE_OPEN';
export const FILE_CLOSE = 'FILE_CLOSE';
export const FILE_CREATE = 'FILE_CREATE';
export const FILE_DELETE = 'FILE_DELETE';
export const FILE_MOVE = 'FILE_MOVE';
export const FILE_RENAME = 'FILE_RENAME';
export const FILE_CHANGE = 'FILE_CHANGE';

export function openFile(id) { 
    return { type: FILE_OPEN, id };
}

export function closeFile() { 
    return { type: FILE_CLOSE };
}

export function createFile(name, parent, content) { 
    return { type: FILE_CREATE, name, parent, content };
}

export function deleteFile(id) {
    return { type: FILE_DELETE, id };
}

export function moveFile(id, parent) { 
    return { type: FILE_MOVE, id, parent };
}

export function renameFile(id, name) { 
    return { type: FILE_RENAME, id, name };
}

export function changeFile(id, content) { 
    return { type: FILE_CHANGE, id, content };
}