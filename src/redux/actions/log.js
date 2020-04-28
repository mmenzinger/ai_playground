export const LOG_ADD = 'LOG_ADD';
export const LOG_CLEAR = 'LOG_CLEAR';
export const LOG_SUBSCRIBE = 'LOG_SUBSCRIBE';
export const LOG_UNSUBSCRIBE = 'LOG_UNSUBSCRIBE';



export function addLog(log) {
    return async (dispatch, getState) => {
        const state = getState();
        const action = { type: LOG_ADD, log }
        for (const [name, subscriber] of Object.entries(state.log.subscribers)) {
            subscriber.callback(action);
        }
        dispatch(action);
    }

}

export function clearLog() {
    return (dispatch, getState) => {
        const state = getState();
        const action = { type: LOG_CLEAR }
        for (const [name, subscriber] of Object.entries(state.log.subscribers)) {
            subscriber.callback(action);
        }
        dispatch(action);
    }
}

export function subscribeToLog(name, callback) {
    return { type: LOG_SUBSCRIBE, name, callback };
}

export function unsubscribeToLog(name) {
    return { type: LOG_UNSUBSCRIBE, name };
}