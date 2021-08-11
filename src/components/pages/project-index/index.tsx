import React, { useEffect, useState } from 'react';
import { Card, Button, ButtonGroup, CardDeck } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import { autorun } from 'mobx';

// import appStore from '@store/app-store';
import store, { Project } from '@store';

import css from './project-index.module.css';

import db from '@localdb';

import { getScenarios } from '@src/webpack-utils';

import { ModalAbort } from '@elements/modal';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import {
    showNewProjectModal,
    showDeleteProjectModal,
    showDownloadProjectModal,
} from '@elements/modal';
import { useHistory } from 'react-router-dom';

export function ProjectIndex() {
    const history = useHistory();
    const [projects, setProjects] = useState<Project[]>([]);

    let closed = false;
    useEffect(() => {
        db.getProjects().then((projects) => !closed && setProjects(projects));
        // secure promises to prevent warning (https://dev.to/jexperton/how-to-fix-the-react-memory-leak-warning-d4i)
        return () => {
            closed = true;
        };
    });

    async function onNewProject() {
        try {
            const scenarios = getScenarios();
            const result = await showNewProjectModal(scenarios);
            const scenario = scenarios[result.scenario];
            let template = scenario.templates[result.template];
            if (template.scenario) {
                template.files.push(...scenarios[template.scenario].files);
            }
            await store.project.createProject(
                result.name,
                template.scenario,
                template.files
            );
            setProjects(await db.getProjects());
        } catch (error) {
            if (!(error instanceof ModalAbort)) console.error(error);
        }
    }

    async function onDeleteProject(
        project: Project,
        e: React.MouseEvent<HTMLElement, MouseEvent>
    ) {
        e.stopPropagation();
        try {
            await showDeleteProjectModal(project);
            await store.project.deleteProject(project.id);
            setProjects(await db.getProjects());
        } catch (error) {
            if (!(error instanceof ModalAbort)) console.error(error);
        }
    }

    async function onDownloadProject(
        project: Project,
        e: React.MouseEvent<HTMLElement, MouseEvent>
    ) {
        e.stopPropagation();
        try {
            const result = await showDownloadProjectModal(project);
            const zip = new JSZip();
            const projectFolder = zip.folder('project');
            if (!projectFolder)
                throw Error("zip error creating folder 'project");
            const projectFiles = await db.getProjectFiles(project.id);
            for (const file of projectFiles) {
                projectFolder.file(file.name, file.content || '');
            }
            if (result.globals) {
                const globalFolder = zip.folder('global');
                if (!globalFolder)
                    throw Error("zip error creating folder 'global'");
                const globalFiles = await db.getProjectFiles(0);
                for (const file of globalFiles) {
                    globalFolder.file(file.name, file.content || '');
                }
            }
            zip.file('settings.json', JSON.stringify(project));
            const zipFile = await zip.generateAsync({ type: 'blob' });
            saveAs(zipFile, result.name);
        } catch (error) {
            if (!(error instanceof ModalAbort)) console.error(error);
        }
    }

    // async function onUploadProject() {
    //     try {
    //         // const modal = await appStore.showModal(Modals.GENERIC, uploadProjectTemplate());
    //         // await projectStore.importProject(
    //         //     modal.name,
    //         //     modal.settings.scenario,
    //         //     modal.projectFiles,
    //         //     modal.globalFiles,
    //         //     modal.collision
    //         // );
    //         // this._projects = await db.getProjects();
    //     } catch (error) {
    //         // if( ! (error instanceof ModalAbort) )
    //         //     console.error(error);
    //     }
    // }

    const elements: JSX.Element[] = [];
    projects.forEach((project) => {
        elements.push(
            <Card
                className={css.project}
                key={project.id}
                onClick={() => {
                    history.push(`/project/${project.id}/${project.name}`);
                }}
            >
                <Card.Img
                    variant="top"
                    src={`/${project.id}/first/logo.png`}
                    onError={(e: any) => {
                        e.target.src = '/assets/logo.png';
                    }}
                />
                <Card.Body>
                    <Card.Text>{project.name}</Card.Text>
                </Card.Body>
                <Card.Footer>
                    <ButtonGroup size="sm">
                        <Button
                            variant="outline-secondary"
                            onClick={(e) => onDownloadProject(project, e)}
                        >
                            <img src="assets/interface/download.svg" />
                        </Button>
                        <Button
                            variant="outline-danger"
                            onClick={(e) => onDeleteProject(project, e)}
                        >
                            <img src="assets/interface/trash.svg" />
                        </Button>
                    </ButtonGroup>
                </Card.Footer>
            </Card>
        );
    });
    elements.push(
        <Card onClick={() => onNewProject()} className={css.project} key={0}>
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

    return <CardDeck className={css.projectList}>{elements}</CardDeck>;
}

export default ProjectIndex;
