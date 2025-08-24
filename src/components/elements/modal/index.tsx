import store from '@store';
import { forwardRef, useEffect, useRef } from 'react';

export class ModalAbort extends Error {}

export const Modal = forwardRef((props: {
    onSubmit: () => Promise<any>;
    title?: string;
    submitName?: string;
    cancelName?: string;
    children?: React.ReactElement | React.ReactElement[];
    error?: string;
}, ref: React.Ref<HTMLDialogElement>) => {

    function onClose(){
        (ref as React.RefObject<HTMLDialogElement>)?.current?.close();
        store.app.rejectModal(new ModalAbort());
    }

    async function onSubmit(){
        const value = await props.onSubmit();
        if (value !== undefined){
            (ref as React.RefObject<HTMLDialogElement>)?.current?.close();
            store.app.resolveModal(value);
        }
    }

    return (
        <dialog className="modal" ref={ref} onClose={onClose}>
            <div className="modal-box">
                <h3 className="font-bold mb-4">
                    {props.title ?? 'Title'}
                </h3>
                    {props.children}
                    {props.error && <div className="alert alert-error mt-4" role="alert">{props.error}</div>}
                <div className="modal-action">
                    <div className="flex justify-between w-full">
                        <button className="btn" onClick={onClose}>{props.cancelName ?? 'Cancel'}</button>
                        <button className="btn btn-success" onClick={onSubmit}>{props.submitName ?? 'Submit'}</button>
                    </div>
                </div>
            </div>
        </dialog>
    );
});

export function useFocus<T extends HTMLElement>(): React.RefObject<T | null> {
    const focus = useRef<T | null>(null);

    useEffect(() => {
        let waitWindow = 0;
        let maxTries = 6;
        let timer: NodeJS.Timeout;
        const tryFocus = () => {
            if (focus.current && maxTries > 0) {
                focus.current.focus();
                // Check if focus was successful
                if (document.activeElement !== focus.current) {
                    maxTries--;
                    waitWindow += 10;
                    timer = setTimeout(tryFocus, waitWindow);
                }
            }
            else if(maxTries > 0){
                maxTries--;
                waitWindow += 10;
                timer = setTimeout(tryFocus, waitWindow);
            }
        };
        timer = setTimeout(tryFocus, waitWindow);

        return () => clearTimeout(timer);
    }, []);

    return focus;
}

export default Modal;
export * from './m-alert';
export * from './m-create-file';
export * from './m-create-folder';
export * from './m-create-project';
export * from './m-delete-file';
export * from './m-delete-project';
export * from './m-download-project';
export * from './m-rename-file';
export * from './m-upload-files';
export * from './m-upload-project';