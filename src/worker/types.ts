import { messageWithResult } from '@util';
import { Log } from '@store/types';

export function call(functionName: string, canvas: OffscreenCanvas){
    const msg: CallMessage = {
        type: MessageType.CALL,
        functionName,
        canvas,
    };
    return messageWithResult(msg);
}

export enum MessageType {
    LOG,
    JSON_STORE,
    CALL,
    EVENT,
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
    canvas: OffscreenCanvas,
}

export interface EventMessage {
    type: MessageType.EVENT,
    callbackName: string,
    data: any,
}