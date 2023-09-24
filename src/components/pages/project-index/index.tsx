import React, { useEffect, useState } from 'react';
import store, { Project } from '@store';
import db from '@localdb';

import { getScenarios } from '@src/scenario-utils';
import { ModalAbort } from '@elements/modal';
import { MODAL } from '@elements/modal/modal-handler';


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
            await store.app.openModal(MODAL.NEW_PROJECT, { scenarios });
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
    for(const project of projects){
        elements.push(
            <div 
                className="card card-bordered w-48 bg-base-100 shadow-xl cursor-pointer hover:drop-shadow-lg"
                key={project.id}
                onClick={() => {
                    navigate(`/project/${project.id}/${project.name}`);
                }}
            >
                <figure className="bg-white">
                    <img className="h-48" src={`/${project.id}/first/logo.png`} alt={project.name} onError={(e: any) => {
                        e.target.src = '/assets/logo.png';
                    }}/>
                </figure>
                <div className="card-body justify-between p-2 pt-0 border-t">
                    <h2 className="card-title text-base">{project.name}</h2>
                    <div className="card-actions justify-end join gap-0">
                        <button className="join-item btn btn-sm px-2" onClick={(e) => onDownloadProject(project, e)}>
                            <svg className="w-4 h-4 rounded-none fill-gray-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
                            </svg>
                            {/* <img src="assets/interface/download.svg" className="w-4 h-4 rounded-none" /> */}
                        </button>
                        <button className="join-item btn btn-error btn-sm px-2" onClick={(e) => onDeleteProject(project, e)}>
                        <svg className="w-4 h-4 rounded-none fill-gray-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/>
                        </svg>
                            {/* <img src="assets/interface/trash.svg" className="w-4 h-4 rounded-none" /> */}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    elements.push(
        <div 
            className="card card-bordered w-48 bg-base-100 shadow-xl cursor-pointer hover:drop-shadow-lg"
            key={0}
            onClick={() => onNewProject()}
        >
            <figure className="bg-white">
            <svg className="h-48 p-16 fill-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
            </svg>
                {/* <img src={`/assets/interface/add.svg`} alt="New Project" className="p-10" /> */}
            </figure>
            <div className="card-body justify-between p-2 pt-0 border-t">
                <h2 className="card-title text-base">New Project</h2>
                <div className="card-actions justify-end join gap-0">
                    <button className="join-item btn btn-sm px-2" onClick={undefined/*(e) => onDownloadProject(project, e)*/}>
                    <svg className="w-4 h-4 rounded-none fill-gray-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M288 109.3V352c0 17.7-14.3 32-32 32s-32-14.3-32-32V109.3l-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352H192c0 35.3 28.7 64 64 64s64-28.7 64-64H448c35.3 0 64 28.7 64 64v32c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V416c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/>
                    </svg>
                        {/* <img src="assets/interface/upload.svg" className="w-4 h-4 rounded-none" /> */}
                    </button>
                </div>
            </div>
        </div>
    );

    return <div className="flex gap-3 m-3">{elements}</div>;
}

export default ProjectIndex;
