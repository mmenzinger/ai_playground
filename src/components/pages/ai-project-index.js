import { html, unsafeCSS } from 'lit-element';
import { LazyElement } from 'components/elements/lazy-element.js';
import { store } from 'src/store.js';
import { showModal } from 'actions/modal.js';

import { createProject, deleteProject } from 'actions/projects.js';

import db from 'src/localdb.js';

import { getTemplates, getExamples } from 'src/webpack-utils.js';

import { Modals, ModalAbort } from 'elements/c4f-modal.js';
import { newProjectTemplate, newExampleTemplate, deleteProjectTemplate } from 'modals/templates.js';



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
            const modal = await store.dispatch(showModal(Modals.GENERIC, newProjectTemplate(templates)));
            const template = templates[modal.template];
            await store.dispatch(createProject(modal.name, template.scenario, template.files));
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
            const modal = await store.dispatch(showModal(Modals.GENERIC, newExampleTemplate(examples)));
            const example = examples[modal.example];
            await store.dispatch(createProject(modal.name, example.scenario, example.files));
            this._projects = await db.getProjects();
        }
        catch (error) {
            if( ! (error instanceof ModalAbort) )
                console.error(error);
        }
    }

    async onDeleteProject(project) {
        try {
            const modal = await store.dispatch(showModal(Modals.GENERIC, deleteProjectTemplate(project)));
            await store.dispatch(deleteProject(project.id));
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
