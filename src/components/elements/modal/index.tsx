import { Modal, Button } from 'react-bootstrap';
import React, { Component } from 'react';
import { reaction } from 'mobx';

import appStore from '@store/app-store';

export class ModalAbort extends Error {}

export type ModalTemplate = {
    title: string;
    submit: string;
    cancel: string;
    body: JSX.Element;
    // init?: (root: ShadowRoot) => Promise<void>;
    // check?: (fields: { [key: string]: any }) => Promise<Error | true>;
    // result?: (root: ShadowRoot) => Promise<any>;
    // change?: { [key: string]: (e: Event, shadowRoot: ShadowRoot) => void };
};

export type ModalObject = {
    template: ModalTemplate;
    result: any;
};

type ModalState = {
    modal: ModalObject | null;
};
export class MyModal extends Component {
    state: ModalState = {
        modal: null,
    };

    constructor(props: {}) {
        super(props);

        reaction(
            () => appStore.modalOpen,
            () => {
                this.setState({
                    modal: appStore.modal,
                });
            },
            {
                delay: 1,
            }
        );
    }

    render() {
        console.log(this.state);
        const modal = this.state.modal;
        const title = modal?.template.title || 'Title';
        const submit = modal?.template.submit || 'Submit';
        const cancel = modal?.template.cancel || 'Cancel';
        const body = modal?.template.body || <></>;

        return (
            <Modal show={modal !== null}>
                <Modal.Header>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{body}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleClose}>
                        {cancel}
                    </Button>
                    <Button variant="primary" onClick={this.handleCommit}>
                        {submit}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    handleClose() {
        appStore.rejectModal(new ModalAbort());
    }

    handleCommit() {
        appStore.resolveModal({});
    }
}

export default MyModal;
