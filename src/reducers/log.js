import {
    LOG_ADD,
    LOG_CLEAR,
} from 'actions/log.js';

const INITIAL_STATE = {
    logs: [],
};

const log = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case LOG_ADD: return addLog(state, action);
        case LOG_CLEAR: return clearLog(state, action);
        default: return state;
    }
};

function addLog(state, action) {
    return {
        ...state,
        logs: [...state.logs, action.log],
    };
}

function clearLog(state, action) {
    return {
        ...state,
        logs: [],
    };
}

export default log;
