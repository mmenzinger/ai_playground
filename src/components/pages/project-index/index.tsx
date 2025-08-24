import React, { useEffect, useState } from 'react';
import store, { Project } from '@store';
import db from '@localdb';

import { getScenarios } from '@src/scenario-utils';
import { ModalAbort } from '@elements/modal';
import { MODAL } from '@elements/modal/modal-handler';

import { FaUpload, FaDownload, FaPlus, FaTrash } from 'react-icons/fa6';


// import {
//     showNewProjectModal,
//     showDeleteProjectModal,
//     showDownloadProjectModal,
// } from '@elements/modal';
import { useNavigate } from 'react-router-dom';

export function ProjectIndex() {
    const navigate = useNavigate();
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
        const scenarios = await getScenarios();
        try{
            await store.app.openModal(MODAL.CREATE_PROJECT, { scenarios });
            setProjects(await db.getProjects());
        }
        catch(error){
            if (!(error instanceof ModalAbort)){
                console.error(error);
            }
        }
    }

    async function onDeleteProject(
        project: Project,
        e: React.MouseEvent<HTMLElement, MouseEvent>
    ) {
        e.stopPropagation();
        try {
            await store.app.openModal(MODAL.DELETE_PROJECT, { project });
            setProjects(await db.getProjects());
        } catch (error) {
            if (!(error instanceof ModalAbort)){
                console.error(error);
            }
        }
    }

    async function onDownloadProject(
        project: Project,
        e: React.MouseEvent<HTMLElement, MouseEvent>
    ) {
        e.stopPropagation();
        try {
            await store.app.openModal(MODAL.DOWNLOAD_PROJECT, { project });
        } catch (error) {
            if (!(error instanceof ModalAbort)){
                console.error(error);
            }
        }
    }

    async function onUploadProject(
        e: React.MouseEvent<HTMLElement, MouseEvent>
    ) {
        e.stopPropagation();
        try {
            await store.app.openModal(MODAL.UPLOAD_PROJECT);
        } catch (error) {
            if (!(error instanceof ModalAbort)){
                console.error(error);
            }
        }
    }

    const elements: React.ReactElement[] = [];
    for(const project of projects){
        elements.push(
            <div 
                className="card w-48 bg-base-100 border-1 border-base-300 cursor-pointer hover:bg-base-200 hover:border-primary"
                key={project.id}
                onClick={() => {
                    navigate(`/editor/${project.id}/${project.name}`);
                }}
            >
                <figure className="flex justify-center items-center">
                    <img 
                        className="h-48"
                        src={`/${project.id}/first/logo.png`}
                        alt={project.name}
                        onError={(e: any) => {
                            e.target.src = '/assets/logo.png';
                        }}
                    />
                </figure>
                <div className="card-body justify-between p-2 pt-0">
                    <h2 className="card-title text-base">{project.name}</h2>
                    <div className="card-actions flex justify-end gap-0">
                        <button
                            className="btn btn-sm btn-ghost tooltip hover:text-primary"
                            onClick={(e) => onDownloadProject(project, e)}
                            data-tip="Download"
                        >
                            <FaDownload className="w-4 h-4" />
                        </button>
                        <button
                            className="btn btn-sm btn-ghost tooltip text-error hover:bg-error hover:text-error-content"
                            onClick={(e) => onDeleteProject(project, e)}
                            data-tip="Delete"
                        >
                            <FaTrash className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    elements.push(
        <div 
            className="card w-48 bg-base-100 border-1 border-base-300 cursor-pointer hover:bg-base-200 hover:border-primary"
            key={0}
            onClick={() => onNewProject()}
        >
            <figure className="h-48 flex justify-center items-center">
                <FaPlus className="w-24 h-24 fill-primary" />
            </figure>
            <div className="card-body justify-between p-2 pt-0">
                <h2 className="card-title text-base">New Project</h2>
                <div className="card-actions flex justify-end gap-0">
                    <button
                        className="btn btn-sm btn-ghost tooltip hover:text-primary"
                        onClick={(e) => onUploadProject(e)}
                        data-tip="Upload"
                    >
                        <FaUpload className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return <div className="flex flex-wrap gap-3 m-3">{elements}</div>;
}

export default ProjectIndex;
