import { MouseEventMessage, ResizeEventMessage, KeyboardEventMessage } from '@src/components/elements/simulator/worker-utils';

// Global interface extensions for custom properties
declare global {
    interface Window {
        __onMouseDown?: (e?: MouseEventMessage) => void;
        __onMouseMove?: (e?: MouseEventMessage) => void;
        __onMouseUp?: (e?: MouseEventMessage) => void;
        __onKeyDown?: (e?: KeyboardEventMessage) => void;
        __onKeyUp?: (e?: KeyboardEventMessage) => void;
        __onKeyPress?: (e?: KeyboardEventMessage) => void;
        __onResize?: (e?: ResizeEventMessage) => void;
        __messagePort?: MessagePort;
        __canvas?: OffscreenCanvas;
        __onVideoFrameUpdate?: (data: ImageBitmap) => void;
    }
    
    interface WorkerGlobalScope {
        __onMouseDown?: (e?: MouseEventMessage) => void;
        __onMouseMove?: (e?: MouseEventMessage) => void;
        __onMouseUp?: (e?: MouseEventMessage) => void;
        __onResize?: (e?: ResizeEventMessage) => void;
        __messagePort?: MessagePort;
        __canvas?: OffscreenCanvas;
        __onVideoFrameUpdate?: (data: ImageBitmap) => void;
    }
}

// This export is needed to make this a module file
export {};
