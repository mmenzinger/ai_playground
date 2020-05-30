import { html } from 'lit-element';
import { LazyElement } from '@element/lazy-element';
import appStore from '@store/app-store';
import projectStore from '@store/project-store';

import db from '@localdb';

import { getScenarios, getTemplates, getExamples } from '@src/webpack-utils';

import { Modals, ModalAbort } from '@element/c4f-modal';
import { newProjectTemplate, newExampleTemplate, deleteProjectTemplate, downloadProjectTemplate } from '@modal/templates';

import JSZip from "jszip";
import { saveAs } from 'file-saver';

import sharedStyles from '@shared-styles';
import style from './ai-project-index.css';

class AiProjectIndex extends LazyElement {
    static get properties() {
        return {
            _projects: { type: Array },
        };
    }

    static get styles() {
        return [
            sharedStyles,
            style
        ];
    }

    constructor() {
        super();
        this._projects = [];
    }

    render() {
        const elements = [];
        this._projects.forEach(project => {
            elements.push(html`
                <li>
                    <header>
                        <a href="?project=${project.id}">
                            <h1>${project.name}</h1>
                            <div class="logo" ><embed src="assets/${project.scenario}/logo.svg"></div>
                        </a>
                    </header>
                    <footer>
                        <a title="delete" @click=${() => this.onDeleteProject(project)}><img src="assets/interface/trash.svg"></a>
                        <a title="download" @click=${() => this.onDownloadProject(project)}><img src="assets/interface/download.svg"></a>
                    </footer>
                </li>
            `);
        });
        elements.push(html`
            <li>
                <header>
                    <a @click=${this.onNewProject}>
                        <h1>New Project</h1>
                        <div class="logo"><embed style="height:50%" src="assets/interface/add.svg"></div>
                    </a>
                </header>
                <footer>
                    <a title="upload" @click=${this.onUploadProject}><img src="assets/interface/upload.svg"></a>
                </footer>
        `);
        return html`
            <h1>Projects</h1>
            <ul id="projects">${elements}</ul>
        `;
    }

    async onNewProject() {
        try {
            const scenarios = getScenarios();
            const modal = await appStore.showModal(Modals.GENERIC, newProjectTemplate(scenarios));
            const scenario = scenarios[modal.scenario];
            let template = scenario.templates[modal.template];
            if(!template)
                template = scenario.examples[modal.template];
            template.files.push(scenario.description);
            await projectStore.createProject(modal.name, template.scenario, template.files);
            this._projects = await db.getProjects();
        }
        catch (error) {
            if( ! (error instanceof ModalAbort) )
                console.error(error);
        }
    }

    async onDeleteProject(project) {
        try {
            const modal = await appStore.showModal(Modals.GENERIC, deleteProjectTemplate(project));
            await projectStore.deleteProject(project.id);
            this._projects = await db.getProjects();
        }
        catch (error) {
            if( ! (error instanceof ModalAbort) )
                console.error(error);
        }
    }

    async onDownloadProject(project) {
        try{
            const modal = await appStore.showModal(Modals.GENERIC, downloadProjectTemplate(project));
            const zip = new JSZip();
            const projectFolder = zip.folder('project');
            const projectFiles = await db.getProjectFiles(project.id);
            for(const file of projectFiles){
                projectFolder.file(file.name, file.content);
            }
            if(modal.globals){
                const globalFolder = zip.folder('global');
                const globalFiles = await db.getProjectFiles(0);
                for(const file of globalFiles){
                    globalFolder.file(file.name, file.content);
                }
            }
            zip.file('settings.json', JSON.stringify(project));
            const zipFile = await zip.generateAsync({type:"blob"});
            saveAs(zipFile, modal.name);
        }
        catch (error) {
            if( ! (error instanceof ModalAbort) )
                console.error(error);
        }
    }

    async onUploadProject() {
        try{
            const modal = await appStore.showModal(Modals.UPLOAD_PROJECT);
            await projectStore.importProject(
                modal.name,
                modal.settings.scenario,
                modal.projectFiles,
                modal.globalFiles,
                modal.collision
            );
            this._projects = await db.getProjects();
        }
        catch (error) {
            if( ! (error instanceof ModalAbort) )
                console.error(error);
        }
    }

    firstUpdated() {
        db.getProjects().then(projects => {
            this._projects = projects;
        });
    }
}

window.customElements.define('ai-project-index', AiProjectIndex);
