import React, { useState, useEffect } from 'react';
import { Modal as ReactModal, Button } from 'react-bootstrap';
import { autorun } from 'mobx';

import appStore from '@store/app-store';
import { Defer } from '@util';

export class ModalAbort extends Error {}

export type ModalTemplate = {
    title: string;
    submit: string;
    cancel: string;
    body: JSX.Element;
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
    const [body, setBody] = useState(<></>);

    useEffect(
        () => {
            autorun(() => {
                setModal(appStore.modal);
                const t = appStore.modal?.template;
                if (t) {
                    setTitle(t.title);
                    setSubmit(t.submit);
                    setCancel(t.cancel);
                    setBody(t.body);
                }
            });
        },
        [] /* <- this is important for autorun to get cleaned up! (https://mobx-react.js.org/recipes-effects) */
    );

    function close() {
        appStore.rejectModal(new ModalAbort());
    }

    return (
        <ReactModal
            show={modal !== null}
            centered
            onHide={close}
            onEscapeKeyDown={close}
        >
            <ReactModal.Header>
                <ReactModal.Title>{title}</ReactModal.Title>
            </ReactModal.Header>
            <ReactModal.Body>{body}</ReactModal.Body>
            <ReactModal.Footer>
                <Button variant="secondary" onClick={close}>
                    {cancel}
                </Button>
                <Button
                    variant="primary"
                    onClick={() => appStore.resolveModal()}
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
export * from './mUploadProject';
