import React, { Component } from 'react';
import appStore from '@src/store/app-store';
import { Project } from '@store/types';

type Props = {
    project: Project;
};

class DeleteProjectModal extends Component<Props> {
    render() {
        return (
            <p>
                Are you sure you want to <em>permanently</em> delete the project
                '{this.props.project.name}'?
                <br />
                This operation can not be undone!
            </p>
        );
    }
}

export default async function showDeleteProjectModal(
    project: Project
): Promise<void> {
    await appStore.showModal({
        title: 'Permanently Delete Project',
        submit: 'Delete',
        cancel: 'Cancel',

        body: <DeleteProjectModal project={project} />,
    });
}
