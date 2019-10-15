import {
    FILE_OPEN,
    FILE_CLOSE,
    FILE_CREATE,
    FILE_DELETE,
    FILE_MOVE,
    FILE_RENAME,
    FILE_CHANGE,
} from 'actions/files.js';

const INITIAL_STATE = {
    opened: -1,
    incrementalKey: 1,
    files: {},
    parents: {},
};

const files = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FILE_OPEN: return openFile(state, action);
        case FILE_CLOSE: return closeFile(state, action);
        case FILE_CREATE: return createFile(state, action);
        case FILE_DELETE: return deleteFile(state, action);
        case FILE_MOVE: return moveFile(state, action);
        case FILE_RENAME: return renameFile(state, action);
        case FILE_CHANGE: return changeFile(state, action);
        default: return state;
    }
};

function openFile(state, action) {
    return {
        ...state,
        opened: action.id,
    };
}

function closeFile(state, action) {
    return {
        ...state,
        opened: -1,
    };
}

function createFile(state, action) {
    const files = { ...state.files };
    const parents = { ...state.parents };
    const id = state.incrementalKey;
    files[id] = {
        name: action.name,
        content: action.content,
    };
    parents[id] = action.parent;
    return {
        ...state,
        incrementalKey: id + 1,
        files,
        parents,
    };
}

function deleteFile(state, action) {
    const files = { ...state.files };
    const parents = { ...state.parents };
    const recRemove = (id) => {
        for(const [childId, parent] of Object.entries(parents)){
            if(Number(parent) === Number(id)){ // id can be string or numeric...
                recRemove(childId);
            }
        }
        // mutation is fine, loop works on copy (Object.entries)
        // and deleting same entry multiple times is fine too
        delete files[id];
        delete parents[id];
    }
    recRemove(action.id);
    return {
        ...state,
        files,
        parents,
    };
}

function moveFile(state, action) {
    const parents = { ...state.parents };
    parents[action.id] = action.parent;
    return {
        ...state,
        parents,
    };
}

function renameFile(state, action) {
    const files = { ...state.files };
    files[action.id] = {
        ...files[action.id],
        name: action.name,
    };
    return {
        ...state,
        files,
    };
}

function changeFile(state, action) {
    const files = { ...state.files };
    files[action.id] = {
        ...files[action.id],
        content: action.content,
    };
    return {
        ...state,
        files,
    };
}

export default files;
