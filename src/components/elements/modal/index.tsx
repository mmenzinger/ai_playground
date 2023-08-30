import { useState, useEffect } from 'react';
import { Modal as ReactModal, Button } from 'react-bootstrap';
import { autorun } from 'mobx';

import store from '@store';
import { Defer } from '@src/utils';

export class ModalAbort extends Error {}

export type ModalTemplate = {
    title: string;
    submit: string;
    cancel: string;
    body: JSX.Element;
    type?: string;
};

export type ModalObject = {
    template: ModalTemplate;
    result?: any;
    defer: Defer<any>;
};

export function Modal() {
    const [modal, setModal] = useState<ModalObject | null>(null);
    const [title, setTitle] = useState('Title');
    const [submit, setSubmit] = useState('Submit');
    const [cancel, setCancel] = useState('Cancel');
    const [type, setType] = useState<string>();
    const [body, setBody] = useState(<></>);

    useEffect(() => {
        autorun(() => {
            setModal(store.app.modal);
            const t = store.app.modal?.template;
            if (t) {
                setTitle(t.title);
                setSubmit(t.submit);
                setCancel(t.cancel);
                setBody(t.body);
                setType(t.type);
            }
        });
    }, []);

    function close() {
        store.app.rejectModal(new ModalAbort());
    }

    return (
        <ReactModal
            show={modal !== null}
            centered
            onHide={close}
            onEscapeKeyDown={close}
            scrollable
        >
            <ReactModal.Header
                className={type === 'danger' ? 'alert-danger' : ''}
            >
                <ReactModal.Title>{title}</ReactModal.Title>
            </ReactModal.Header>
            <ReactModal.Body>{body}</ReactModal.Body>
            <ReactModal.Footer style={{ justifyContent: 'space-between' }}>
                <Button variant="secondary" onClick={close}>
                    {cancel}
                </Button>
                <Button
                    variant={type === 'danger' ? 'danger' : 'primary'}
                    onClick={() => store.app.resolveModal()}
                >
                    {submit}
                </Button>
            </ReactModal.Footer>
        </ReactModal>
    );
}

export default Modal;
export * from './mNewProject';
export * from './mDeleteProject';
export * from './mDownloadProject';
// export * from './mUploadProject';
