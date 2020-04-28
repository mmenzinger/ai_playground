import {
    LOG_ADD,
    LOG_CLEAR,
    LOG_SUBSCRIBE,
    LOG_UNSUBSCRIBE,
} from 'actions/log.js';

const INITIAL_STATE = {
    subscribers: {},
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
    const subscribers = {...state.subscribers};
    subscribers[action.name] = { callback: action.callback };
    return {
        ...state,
        subscribers,
    }
}

function unsubscribeLog(state, action){
    const subscribers = {...state.subscribers};
    subscribers[action.name] = undefined;
    return {
        ...state,
        subscribers
    }
}

export default log;
