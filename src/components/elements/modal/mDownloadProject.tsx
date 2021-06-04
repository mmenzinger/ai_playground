import React, { useEffect, useState } from 'react';
import { Project } from '@store/types';
import { Col, Form, Row, Modal, Button } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import appStore from '@src/store/app-store';

type DownloadProjectResult = {
    name: string;
    globals: boolean;
};

export function DownloadProject(props: { project: Project }) {
    const [name, setName] = useState(`${props.project.name}.zip`);
    const [globals, setGlobals] = useState(false);

    useEffect(() => {
        appStore.updateModalResult({ name, globals });
    });

    return (
        <Form>
            <Form.Group as={Row} controlId="name">
                <Form.Label column sm="2">
                    Name
                </Form.Label>
                <Col sm="10">
                    <Form.Control
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                    />
                </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="options">
                <Form.Label column sm="2">
                    Options
                </Form.Label>
                <Col sm="10">
                    <Form.Group controlId="includeGlobals">
                        <Form.Check
                            type="checkbox"
                            label="Include global files"
                            checked={globals}
                            onChange={(e) => setGlobals(e.target.checked)}
                        />
                    </Form.Group>
                </Col>
            </Form.Group>
        </Form>
    );
}

export async function showDownloadProjectModal(
    project: Project
): Promise<DownloadProjectResult> {
    return await appStore.showModal({
        title: 'Download Project',
        submit: 'Download',
        cancel: 'Cancel',
        body: <DownloadProject project={project} />,
    });
}
