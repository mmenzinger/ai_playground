import {
    FILE_OPEN,
    FILE_CLOSE,
    FILE_CREATE,
    FILE_SAVE,
    FILE_DELETE,
    FILE_RENAME,
    FILE_ERRORS,
    FILES_SUBSCRIBE,
    FILES_UNSUBSCRIBE,
} from 'actions/files.js';

const INITIAL_STATE = {
    currentFile: null,
    lastFilesChange: 0,
    subscribers: {},
    /*lastChangeFileTree: 0,
    lastChangeFileContent: 0,
    lastChangeFileId: 0,*/
};

const files = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FILE_OPEN: return openFile(state, action);
        case FILE_CLOSE: return closeFile(state, action);
        case FILE_CREATE: return createFile(state, action);
        case FILE_SAVE: return saveFile(state, action);
        case FILE_DELETE: return deleteFile(state, action);
        case FILE_RENAME: return renameFile(state, action);
        case FILE_ERRORS: return setFileErrors(state, action);
        case FILES_SUBSCRIBE: return subscribeFiles(state, action);
        case FILES_UNSUBSCRIBE: return unsubscribeFiles(state, action);
        default: return state;
    }
};

function openFile(state, action) {
    return {
        ...state,
        currentFile: action.file,
    };
}

function closeFile(state, action) {
    return {
        ...state,
        currentFile: null,
    };
}

function createFile(state, action) {
    return {
        ...state,
        lastFilesChange: action.timestamp,
    };
}

function saveFile(state, action) {
    const newState = {...state};
    // update if current
    if(state.currentFile.id === action.id){
        newState.currentFile = {
            ...state.currentFile,
            content: action.content,
            lastChange: action.timestamp,
        }
    }
    return newState;
}

function deleteFile(state, action) {
    const currentFile = (state.currentFile.id === action.id) ? undefined : state.currentFile;
    return {
        ...state,
        currentFile,
        lastFilesChange: action.timestamp,
        //lastChangeFileTree: action.timestamp,
    };
}

function renameFile(state, action) {
    return {
        ...state,
        lastFilesChange: action.timestamp,
        //lastChangeFileTree: action.timestamp,
    };
}

function setFileErrors(state, action) {
    const newState = {...state};
    // update if current
    if(state.currentFile.id === action.id){
        newState.currentFile = {
            ...state.currentFile,
            errors: action.errors,
            lastChange: action.timestamp,
        }
    }
    return newState;
}

function subscribeFiles(state, action){
    const subscribers = {...state.subscribers};
    subscribers[action.name] = { callback: action.callback };
    return {
        ...state,
        subscribers,
    }
}

function unsubscribeFiles(state, action){
    const subscribers = {...state.subscribers};
    subscribers[action.name] = undefined;
    return {
        ...state,
        subscribers
    }
}

export default files;
