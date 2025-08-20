// import { useState, useEffect } from 'react';
// import { autorun } from 'mobx';

import store from '@store';
import { Modal as DaisyModal, Alert, Button } from 'react-daisyui';

// import { Defer } from '@src/utils';

export class ModalAbort extends Error {}

// export type ModalTemplate = {
//     title: string;
//     submit: string;
//     cancel: string;
//     body: JSX.Element;
//     type?: string;
// };

// export type ModalObject = {
//     template: ModalTemplate;
//     result?: any;
//     defer: Defer<any>;
// };

import { forwardRef } from 'react';

export const Modal = forwardRef((props: {
    onSubmit: () => Promise<any>;
    title?: string;
    submitName?: string;
    cancelName?: string;
    children?: React.ReactElement;
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
        <DaisyModal ref={ref} onClose={onClose} ariaHidden={false}>
            <DaisyModal.Header className="font-bold mb-4">
                {props.title ?? 'Title'}
            </DaisyModal.Header>
            <DaisyModal.Body>
                {props.children}
                {props.error && <Alert status="error">{props.error}</Alert>}
            </DaisyModal.Body>
            <DaisyModal.Actions>
                <div className="flex justify-between w-full">
                    <Button color="error" onClick={onClose}>{props.cancelName ?? 'Cancel'}</Button>
                    <Button color="success" onClick={onSubmit}>{props.submitName ?? 'Submit'}</Button>
                </div>
            </DaisyModal.Actions>
        </DaisyModal>
    );
});

export default Modal;
export * from './m-new-project';
export * from './m-delete-project';
export * from './m-download-project';
export * from './m-upload-project';



// import { useState, useEffect } from 'react';
// import { autorun } from 'mobx';

// import store from '@store';

// import { Defer } from '@src/utils';

// export class ModalAbort extends Error {}

// export type ModalTemplate = {
//     title: string;
//     submit: string;
//     cancel: string;
//     body: JSX.Element;
//     type?: string;
// };

// export type ModalObject = {
//     template: ModalTemplate;
//     result?: any;
//     defer: Defer<any>;
// };

// export function Modal(props: {}) {
//     const [modal, setModal] = useState<ModalObject | null>(null);
//     const [title, setTitle] = useState('Title');
//     const [submit, setSubmit] = useState('Submit');
//     const [cancel, setCancel] = useState('Cancel');
//     const [type, setType] = useState<string>();
//     const [body, setBody] = useState(<></>);

//     useEffect(() => {
//         autorun(() => {
//             setModal(store.app.modal);
//             const t = store.app.modal?.template;
//             if (t) {
//                 setTitle(t.title);
//                 setSubmit(t.submit);
//                 setCancel(t.cancel);
//                 setBody(t.body);
//                 setType(t.type);
//             }
//         });
//     }, []);

//     function reject() {
//         store.app.rejectModal(new ModalAbort());
//     }
//     function resolve(){
//         store.app.resolveModal();
//     }

//     return (
//         <dialog className="modal bg-base-content bg-opacity-50" open={modal !== null}>
//             <div className="modal-box">
//                 <h3 className="font-bold text-lg pb-4">{title}</h3>
//                 {body}
//                 <div className="modal-action flex justify-between pt-4">
//                     <button className="btn btn-error" onClick={reject}>{cancel}</button>
//                     <button className="btn btn-success" onClick={resolve}>{submit}</button>
//                 </div>
//             </div>
//         </dialog>
//     );
// }

// export default Modal;
// export * from './mNewProject';
// export * from './mDeleteProject';
// export * from './mDownloadProject';
// // export * from './mUploadProject';
