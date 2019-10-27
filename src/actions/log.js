export const LOG_ADD = 'LOG_ADD';
export const LOG_CLEAR = 'LOG_CLEAR';

export function addLog(log) { 
    return { type: LOG_ADD, log };
}

export function clearLog() { 
    return { type: LOG_CLEAR };
}