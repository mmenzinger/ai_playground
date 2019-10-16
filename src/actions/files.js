export const FILE_OPEN = 'FILE_OPEN';
export const FILE_CLOSE = 'FILE_CLOSE';
export const FILE_CREATE = 'FILE_CREATE';
export const FILE_DELETE = 'FILE_DELETE';
export const FILE_MOVE = 'FILE_MOVE';
export const FILE_RENAME = 'FILE_RENAME';

export function openFile(id) { 
    return { type: FILE_OPEN, id };
}

export function closeFile() { 
    return { type: FILE_CLOSE };
}

export function createFile() {
    return { type: FILE_CREATE, timestamp: Date.now() };
}

export function deleteFile(id) {
    return { type: FILE_DELETE, id, timestamp: Date.now() };
}

export function renameFile() { 
    return { type: FILE_RENAME, timestamp: Date.now() };
}