import React from 'react';
import appStore from '@src/store/app-store';
import { Project } from '@store/types';
import { Alert } from 'react-bootstrap';

function DeleteProjectModal(props: { project: Project }) {
    return (
        <p>
            Are you sure you want to <em>permanently</em> delete the project '
            {props.project.name}'?
            <br />
            This operation can not be undone!
        </p>
    );
}

export async function showDeleteProjectModal(project: Project): Promise<void> {
    await appStore.showModal({
        title: 'Permanently Delete Project',
        submit: 'Delete',
        cancel: 'Cancel',
        body: <DeleteProjectModal project={project} />,
        type: 'danger',
    });
}
