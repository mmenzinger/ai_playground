import {
    FILE_OPEN,
    FILE_CLOSE,
    FILE_CREATE,
    FILE_SAVE,
    FILE_DELETE,
    FILE_RENAME,
} from 'actions/files.js';

const INITIAL_STATE = {
    currentFile: 0,
    lastChangeFileTree: 0,
    lastChangeFileContent: 0,
    lastChangeFileId: 0,
};

const files = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FILE_OPEN: return openFile(state, action);
        case FILE_CLOSE: return closeFile(state, action);
        case FILE_CREATE: return createFile(state, action);
        case FILE_SAVE: return saveFile(state, action);
        case FILE_DELETE: return deleteFile(state, action);
        case FILE_RENAME: return renameFile(state, action);
        default: return state;
    }
};

function openFile(state, action) {
    return {
        ...state,
        currentFile: action.id,
    };
}

function closeFile(state, action) {
    return {
        ...state,
        currentFile: 0,
    };
}

function createFile(state, action) {
    return {
        ...state,
        lastChangeFileTree: action.timestamp,
        lastChangeFileContent: action.timestamp,
        lastChangeFileId: action.id,
    };
}

function saveFile(state, action) {
    return {
        ...state,
        lastChangeFileContent: action.timestamp,
        lastChangeFileId: action.id,
    };
}

function deleteFile(state, action) {
    const currentFile = (state.currentFile === action.id) ? 0 : state.currentFile;
    return {
        ...state,
        currentFile,
        lastChangeFileTree: action.timestamp,
    };
}

function renameFile(state, action) {
    return {
        ...state,
        lastChangeFileTree: action.timestamp,
    };
}

export default files;
