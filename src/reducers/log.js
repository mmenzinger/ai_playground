import {
    LOG_ADD,
    LOG_CLEAR,
    LOG_SUBSCRIBE,
    LOG_UNSUBSCRIBE,
} from 'actions/log';

const INITIAL_STATE = {
    subscribers: new Set(),
};

const log = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case LOG_ADD: return addLog(state, action);
        case LOG_CLEAR: return clearLog(state, action);
        case LOG_SUBSCRIBE: return subscribeLog(state, action);
        case LOG_UNSUBSCRIBE: return unsubscribeLog(state, action);
        default: return state;
    }
};

function addLog(state, action) {
    return {
        ...state,
    };
}

function clearLog(state, action) {
    return {
        ...state,
    };
}

function subscribeLog(state, action){
    const subscribers = new Set(state.subscribers);
    subscribers.add(action.callback);
    return {
        ...state,
        subscribers
    }
}

function unsubscribeLog(state, action){
    const subscribers = new Set(state.subscribers);
    subscribers.delete(action.callback);
    return {
        ...state,
        subscribers
    }
}

export default log;
