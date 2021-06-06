import { messageWithResult } from '@src/utils';

export enum MessageType {
    LOG,
    JSON_STORE,
    CALL,
    EVENT,
    HTML,
    VIDEO,
}

export interface Message{
    type: MessageType;
}

export interface LogMessage {
    type: MessageType.LOG,
    logs: string[],
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
    canvases: OffscreenCanvas[],
}

export interface EventMessage {
    type: MessageType.EVENT,
    callbackName: string,
    data: any,
}

export interface HtmlMessage {
    type: MessageType.HTML,
    action: 'add' | 'set',
    html: string,
}

export interface VideoMessage {
    type: MessageType.VIDEO,
    bitmap: ImageBitmap,
}

export function call(functionName: string, canvases: OffscreenCanvas[]){
    const msg: CallMessage = {
        type: MessageType.CALL,
        functionName,
        canvases,
    };
    return messageWithResult(msg);
}