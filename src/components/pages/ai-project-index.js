import { html, unsafeCSS } from 'lit-element';
import { LazyElement } from 'components/elements/lazy-element.js';
import appStore from 'store/app-store.js';
import projectStore from 'store/project-store.js';

import db from 'src/localdb.js';

import { getTemplates, getExamples } from 'src/webpack-utils.js';

import { Modals, ModalAbort } from 'elements/c4f-modal.js';
import { newProjectTemplate, newExampleTemplate, deleteProjectTemplate, downloadProjectTemplate } from 'modals/templates.js';

import JSZip from "jszip";
import { saveAs } from 'file-saver';

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./ai-project-index.css').toString());

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
            <button @click=${this.onNewExample}>Load Example</button>
        `;
    }

    async onNewProject() {
        try {
            const templates = getTemplates();
            const modal = await appStore.showModal(Modals.GENERIC, newProjectTemplate(templates));
            const template = templates[modal.template];
            await projectStore.createProject(modal.name, template.scenario, template.files);
            this._projects = await db.getProjects();
        }
        catch (error) {
            if( ! (error instanceof ModalAbort) )
                console.error(error);
        }
    }

    async onNewExample() {
        try {
            const examples = getExamples();
            const modal = await appStore.showModal(Modals.GENERIC, newExampleTemplate(examples));
            const example = examples[modal.example];
            await projectStore.createProject(modal.name, example.scenario, example.files);
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
