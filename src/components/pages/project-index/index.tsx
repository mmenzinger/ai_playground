import React, { Component } from 'react';
import { Card, Button, ButtonGroup, CardDeck } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { autorun } from 'mobx';

import appStore from '@store/app-store';
import projectStore from '@store/project-store';

import css from './project-index.module.css';

import { Project } from '@store/types';

import db from '@localdb';

import { getScenarios } from '@src/webpack-utils';

import { ModalAbort } from '@elements/modal';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import showNewProjectModal from '@elements/modal/mNewProject';
import showDeleteProjectModal from '@elements/modal/mDeleteProject';

// // @ts-ignore
// import sharedStyles from '@shared-styles';
// // @ts-ignore
// import style from './ai-project-index.css';

type ProjectIndexState = {
    projects: Project[];
};

export class ProjectIndex extends Component {
    state: ProjectIndexState = {
        projects: [],
    };

    constructor(props: {}) {
        super(props);
        db.getProjects().then((projects) => this.setState({ projects }));
    }

    render() {
        const elements: JSX.Element[] = [];
        this.state.projects.forEach((project) => {
            elements.push(
                <Card
                    className={css.project}
                    key={project.id}
                    onClick={() => this.onNewProject()}
                >
                    <Card.Img
                        variant="top"
                        src={`/${project.id}/logo.png`}
                        onError={this.onImageError}
                    />
                    <Card.Body>
                        <Card.Text>{project.name}</Card.Text>
                    </Card.Body>
                    <Card.Footer>
                        <ButtonGroup size="sm">
                            <Button
                                variant="outline-secondary"
                                onClick={(e) =>
                                    this.onDownloadProject(project, e)
                                }
                            >
                                <img src="assets/interface/download.svg" />
                            </Button>
                            <Button
                                variant="outline-danger"
                                onClick={(e) =>
                                    this.onDeleteProject(project, e)
                                }
                            >
                                <img src="assets/interface/trash.svg" />
                            </Button>
                        </ButtonGroup>
                    </Card.Footer>
                </Card>
            );
        });
        elements.push(
            <Card
                onClick={() => this.onNewProject()}
                className={css.project}
                key={0}
            >
                <Card.Img variant="top" src="assets/logo.png" />
                <Card.Body>
                    <Card.Text>New Project</Card.Text>
                </Card.Body>
                <Card.Footer>
                    <ButtonGroup size="sm">
                        <Button variant="outline-secondary">
                            <img src="assets/interface/upload.svg" />
                        </Button>
                    </ButtonGroup>
                </Card.Footer>
            </Card>
        );

        return (
            <>
                <h1>Projects</h1>
                <CardDeck className={css.projectList}>{elements}</CardDeck>
            </>
        );
    }

    onImageError(event: any) {
        event.target.src = '/assets/logo.png';
        //this.src='/assets/logo.png';this.onerror=''
    }

    async onNewProject() {
        try {
            const scenarios = getScenarios();
            const result = await showNewProjectModal(scenarios);
            const scenario = scenarios[result.scenario];
            let template = scenario.templates[result.template];
            if (template.scenario) {
                template.files.push(...scenarios[template.scenario].files);
            }
            await projectStore.createProject(
                result.name,
                template.scenario,
                template.files
            );
            this.setState({ projects: await db.getProjects() });
        } catch (error) {
            if (!(error instanceof ModalAbort)) console.error(error);
        }
    }

    async onDeleteProject(
        project: Project,
        e: React.MouseEvent<HTMLElement, MouseEvent>
    ) {
        e.stopPropagation();
        console.log('delete', project.name);

        try {
            await showDeleteProjectModal(project);
            await projectStore.deleteProject(project.id);
            this.setState({ projects: await db.getProjects() });
        } catch (error) {
            if (!(error instanceof ModalAbort)) console.error(error);
        }
    }

    async onDownloadProject(
        project: Project,
        e: React.MouseEvent<HTMLElement, MouseEvent>
    ) {
        e.stopPropagation();
        try {
            // const modal = await appStore.showModal(
            //     downloadProjectTemplate(project)
            // );
            // const zip = new JSZip();
            // const projectFolder = zip.folder('project');
            // if (!projectFolder)
            //     throw Error("zip error creating folder 'project");
            // const projectFiles = await db.getProjectFiles(project.id);
            // for (const file of projectFiles) {
            //     projectFolder.file(file.name, file.content || '');
            // }
            // if (modal.globals) {
            //     const globalFolder = zip.folder('global');
            //     if (!globalFolder)
            //         throw Error("zip error creating folder 'global'");
            //     const globalFiles = await db.getProjectFiles(0);
            //     for (const file of globalFiles) {
            //         globalFolder.file(file.name, file.content || '');
            //     }
            // }
            // zip.file('settings.json', JSON.stringify(project));
            // const zipFile = await zip.generateAsync({ type: 'blob' });
            // saveAs(zipFile, modal.name);
        } catch (error) {
            if (!(error instanceof ModalAbort)) console.error(error);
        }
    }

    async onUploadProject() {
        try {
            // const modal = await appStore.showModal(Modals.GENERIC, uploadProjectTemplate());
            // await projectStore.importProject(
            //     modal.name,
            //     modal.settings.scenario,
            //     modal.projectFiles,
            //     modal.globalFiles,
            //     modal.collision
            // );
            // this._projects = await db.getProjects();
        } catch (error) {
            // if( ! (error instanceof ModalAbort) )
            //     console.error(error);
        }
    }
}

export default ProjectIndex;
