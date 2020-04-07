import { html, unsafeCSS } from 'lit-element';
import { LazyElement } from 'components/elements/lazy-element.js';
import { store } from 'src/store.js';
import { showModal } from 'actions/modal.js';

import { createProject, deleteProject } from 'actions/projects.js';

import db from 'src/localdb.js';

import { getTemplates, getExamples } from 'src/webpack-utils.js';



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
            const options = [];
            for(let i = 0; i < templates.length; i++){
                options.push(html`<option value="${i}">${templates[i].name}</option>`);
            }
            const modal = await store.dispatch(showModal({
                title: 'New Project',
                content: html`
                    <form>
                        <select id="template">${options}</select>
                        <input id="name" type="text" placeholder="Name" autocomplete="off" value="${templates[0].name}">
                    </form>`,
                submit: 'Create',
                abort: 'Cancel',
                check: async (fields) => {
                    if(fields.name.length === 0)
                        return Error('Empty project name! Every project must have a name.');
                    const project = await db.getProjectByName(fields.name);
                    if(project !== undefined)
                        return Error('Duplicate name! A project with that name already exists!');
                },
                change: {
                    template: (e, that) => {
                        const text = e.target.options[e.target.selectedIndex].innerHTML.replace(/<!---->/g, '').trim();
                        that.shadowRoot.querySelector('#name').value = text;
                    }
                }
            }));
            
            const template = templates[modal.template];
            await store.dispatch(createProject(modal.name, template.scenario, template.files));
            this._projects = await db.getProjects();
        }
        catch (error) {
            console.warn(error);
        }
    }

    async onNewExample() {
        try {
            const examples = getExamples();
            const options = [];
            for(let i = 0; i < examples.length; i++){
                options.push(html`<option value="${i}">${examples[i].name}</option>`);
            }
            const modal = await store.dispatch(showModal({
                title: 'Load Example',
                content: html`
                    <form>
                        <select id="example">${options}</select>
                        <input id="name" type="text" placeholder="name" value="${examples[0].name}">
                    </form>`,
                submit: 'Create',
                abort: 'Cancel',
                check: async (fields) => {
                    if(fields.name.length === 0)
                        return Error('Empty project name! Every project must have a name.');
                    const project = await db.getProjectByName(fields.name);
                    if(project !== undefined)
                        return Error('Duplicate name! A project with that name already exists!');
                },
                change: {
                    example: (e, that) => {
                        const text = e.target.options[e.target.selectedIndex].innerHTML.replace(/<!---->/g, '').trim();
                        that.shadowRoot.querySelector('#name').value = text;
                    }
                }
            }));
            
            const example = examples[modal.example];
            await store.dispatch(createProject(modal.name, example.scenario, example.files));
            this._projects = await db.getProjects();
        }
        catch (error) {
            console.warn(error);
        }
    }

    async onDeleteProject(project) {
        try {
            const modal = await store.dispatch(showModal({
                title: 'Permanently Delete Project',
                content: html`
                    <p>Are you sure you want to <em>permanently<em> delete the project '${project.name}'?<br>
                    This operation can not be undone!</p>`,
                submit: 'Delete',
                abort: 'Cancel',
            }));
            
            await store.dispatch(deleteProject(project.id));
            this._projects = await db.getProjects();
        }
        catch (error) {
            console.warn(error);
        }
    }

    firstUpdated() {
        db.getProjects().then(projects => {
            this._projects = projects;
        });
    }
}

window.customElements.define('ai-project-index', AiProjectIndex);
