import { messageWithResult } from '@util';
import { Log } from '@store/types';

export function call(functionName: string, args: any[]){
    const msg: CallMessage = {
        type: MessageType.CALL,
        functionName,
        args,
    };
    return messageWithResult(msg);
}

export enum MessageType {
    LOG,
    JSON_STORE,
    CALL,
}

export enum Functions {
    RUN,
    TRAIN,
}

export interface Message{
    type: MessageType;
}

export interface LogMessage {
    type: MessageType.LOG,
    log: Log,
}

export interface JSONMessage {
    type: MessageType.JSON_STORE,
    projectId?: number,
    fileName: string,
    json: string,
}

export interface CallMessage {
    type: MessageType.CALL,
    file?: string,
    functionName: string,
    args: any[],
}