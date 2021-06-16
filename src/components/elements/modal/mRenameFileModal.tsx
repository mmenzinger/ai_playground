import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import appStore from '@src/store/app-store';
type FileRenameModalResult = {
    newName: string;
    id: number;
};
function RenameFileModal(props: {fileId: number, fileName: string}) {
    const [name, setName] = useState<string>(props.fileName);
    useEffect(() => {
        appStore.updateModalResult({ newName: name, id: props.fileId});
    });
    return (
        <Form>
            <Form.Group as={Row} controlId="nameField">
                <Form.Label column sm="3">
                    New name for {props.fileId}
                </Form.Label>
                <Col sm="9">
                    <Form.Control
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                    />
                </Col>
            </Form.Group>
        </Form>
    );
}

export async function showRenameFileModal(fileId: number, fileName: string): Promise<FileRenameModalResult> {
    return await appStore.showModal({
        title: 'Rename File',
        submit: 'Rename',
        cancel: 'Cancel',
        body: <RenameFileModal fileId={fileId} fileName={fileName}/>,
    });
}
