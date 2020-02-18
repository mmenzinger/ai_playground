export const LOG_ADD = 'LOG_ADD';
export const LOG_CLEAR = 'LOG_CLEAR';
export const LOG_SUBSCRIBE = 'LOG_SUBSCRIBE';
export const LOG_UNSUBSCRIBE = 'LOG_UNSUBSCRIBE';



export function addLog(log) {
    return async (dispatch, getState) => {
        const state = getState();
        const action = { type: LOG_ADD, log }
        for (const callback of state.log.subscribers.values()) {
            callback(action);
        }
        dispatch(action);
    }

}

export function clearLog() {
    return (dispatch, getState) => {
        const state = getState();
        const action = { type: LOG_CLEAR }
        for (const callback of state.log.subscribers.values()) {
            callback(action);
        }
        dispatch(action);
    }
}

export function subscribeLog(callback) {
    return { type: LOG_SUBSCRIBE, callback };
}

export function unsubscribeLog(callback) {
    return { type: LOG_UNSUBSCRIBE, callback };
}