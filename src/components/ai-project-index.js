import { html, unsafeCSS } from 'lit-element';
import { LazyElement } from 'components/lazy-element.js';
import { store } from 'src/store.js';
import { showModal } from 'actions/modal.js';

import db from 'src/localdb.js';

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
                <li><a href="#project/${project.id}">${project.name}</a></li>
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
            const modal = await store.dispatch(showModal({
                fields: [{ id: 'name', type: 'text', placeholder: 'Project Name' }],
                submit: 'Create Project',
                abort: 'Cancel',
            }));
            const project = await db.createProject(modal.name);
            await db.createFile('index.js', project,
                `//importScripts(global('filename.js));
//importScripts(project('filename.js));

function init(state){
}

function update(state, actions){
    // take a random action
    const action = Math.round(Math.random()*(actions.length-1));
    return actions[action];
}

function finish(state, score){
    console.log('finish', state, score);
}`      );
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
