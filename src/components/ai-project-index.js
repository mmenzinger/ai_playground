import { html, unsafeCSS } from 'lit-element';
import { LazyElement } from 'components/lazy-element';
import { store } from 'src/store';
import { showModal } from 'actions/modal';

import { createProject } from 'actions/projects';

import db from 'src/localdb';

import TicTacToe from 'templates/tictactoe';
import TicTacToeMinMax from 'templates/tictactoe-minmax';
import TicTacToeQTable from 'templates/tictactoe-qtable';

const templates = [
    TicTacToe,
    TicTacToeMinMax,
    TicTacToeQTable,
];

const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());
//const style = unsafeCSS(require('./ai-project-index.css').toString());

class AiProjectIndex extends LazyElement {
    static get properties() {
        return {
            _projects: { type: Array },
        };
    }

    static get styles() {
        return [
            sharedStyles,
            //style
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
                <li><a href="?page=project&id=${project.id}">${project.name}</a></li>
            `);
        });
        return html`
            <h1>Projects</h1>
            <ul>${elements}</ul>
            <button @click=${this.onNewProject}>New Project</button>
        `;
    }

    async onNewProject() {
        try {
            const options = [];
            for(let i = 0; i < templates.length; i++){
                options.push(html`<option value="${i}">${templates[i].name}</option>`);
            }
            const modal = await store.dispatch(showModal({
                title: 'New Project',
                content: html`
                    <form>
                        <input id="name" type="text" placeholder="name">
                        <select id="template">${options}</select>
                    </form>`,
                submit: 'Create',
                abort: 'Cancel',
                check: async (fields) => {
                    if(fields.name.length === 0)
                        return Error('Empty project name! Every project must have a name.');
                    const project = await db.getProjectByName(fields.name);
                    if(project !== undefined)
                        return Error('Duplicate name! A project with that name already exists!');
                }
            }));
            
            const template = templates[Number(modal.template)];
            await store.dispatch(createProject(modal.name, template));
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
