import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';

//import { modalShow, modalConsume } from 'actions/app.js';
import { openFile, createFile, deleteFile } from 'actions/files.js';
import { showModal } from 'actions/modal.js';

import db from 'src/localdb.js';


const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());
const style = unsafeCSS(require('./file-tree.css').toString());
//const jstreeStyles = unsafeCSS(require('jstree/dist/themes/default/style.css').toString());
//const icons32 = require('jstree/dist/themes/default/32px.png');
//const icons40 = require('jstree/dist/themes/default/40px.png');
//const iconsThrobber = require('jstree/dist/themes/default/throbber.gif');

class FileTree extends connect(store)(LitElement) {
    static get properties() {
        return {
            _lastChanged: { type: Number },
            _global: { type: Array },
            _project: { type: Array },
            _currentFile: { type: Number },
            _currentProject: { type: Number },
        };
    }
    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    constructor() {
        super();
        this._global = [];
        this._project = [];
    }

    render() {
        const globalFiles = [];
        this._global.forEach(file => {
            let ending = file.name.match(/\.([a-z]+)$/);
            ending = ending === null ? 'unknown' : ending[1];
            globalFiles.push(html`
                <li ?active=${this._currentFile === file.id}>
                    <a @click=${e => { this.onFile(file) }}><img src="assets/filetree/${ending}.svg" class="icon">${file.name}</a>
                    <a class="delete" @click=${e => { this.onDelete(file) }}>x</a>
                </li>
            `);
        });
        const global = html`
            <li>global:<br>
                <ul class="files">${globalFiles}</ul>
                <button @click=${this.onAddFileGlobal}>Add</button>
            </li>
        `;
        const projectFiles = [];
        this._project.forEach(file => {
            let ending = file.name.match(/\.([a-z]+)$/);
            ending = ending === null ? 'unknown' : ending[1];
            projectFiles.push(html`
                <li ?active=${this._currentFile === file.id}>
                    <a @click=${e => { this.onFile(file) }}><img src="assets/filetree/${ending}.svg" class="icon">${file.name}</a>
                    <a class="delete" @click=${e => { this.onDelete(file) }}>x</a>
                </li>
            `);
        });
        const project = html`
            <li>project:<br>
                <ul class="files">${projectFiles}</ul>
                <button @click=${this.onAddFileProject}>Add</button>
            </li>
        `;
        return html`<ul class="folders">${global}${project}</ul>`;
    }

    async onDelete(file) {
        try {
            const project = file.project === 0 ? 'global' : 'project';
            const modal = await store.dispatch(showModal({
                title: 'Delete File',
                content: html`<p>Are you sure you want to <em>permanently</em> delete the <em>${project}</em> file '${file.name}'?</p>`,
                submit: 'Yes Delete',
                abort: 'No',
            }));
            await store.dispatch(deleteFile(file.id));
        }
        catch (error) {
            console.error(error);
        }
    }

    onFile(file) {
        store.dispatch(openFile(file.id));
    }

    onAddFileGlobal() {
        this.addFile(0);
    }

    onAddFileProject() {
        const state = store.getState();
        const project = Number(state.app.params[0]);
        this.addFile(project);
    }

    async addFile(project) {
        try {
            const modal = await store.dispatch(showModal({
                title: 'Create File',
                content: html`
                    <form>
                        <input id="name" type="text" placeholder="filename">
                        <select id="type">
                            <option value="js">.js</option>
                            <option value="json">.json</option>
                            <option value="pl">.pl</option>
                        </select>
                    </form>
                `,
                submit: 'Create File',
                abort: 'Cancel',
                check: async (fields) => {
                    if (fields.name.length === 0)
                        return Error('Empty filname! Every file must have a name.');
                    if (!fields.name.match(/[a-zA-Z0-9_-]/))
                        return Error('Invalid character! Only numbers, letters, _ and - are allowed.');
                    const file = await db.loadFileByName(project, `${fields.name}.${fields.type}`);
                    if (file !== undefined)
                        return Error('Duplicate name! A file with that name and ending already exists!');
                }
            }));
            const id = await store.dispatch(createFile(`${modal.name}.${modal.type}`, project, ''));
        }
        catch (error) {
            console.error(error);
        }
    }

    firstUpdated() {
    }

    stateChanged(state) {
        if (state.files.lastChangeFileTree !== this._lastChanged 
            || state.files.currentFile !== this._currentFile
            || state.projects.currentProject !== this._currentProject) {
            this._lastChanged = state.files.lastChangeFileTree;

            const project = state.projects.currentProject;
            db.getProjectFiles(project).then((files) => {
                this._project = files;
            });
            db.getProjectFiles(0).then((files) => {
                this._global = files;
            });

            this._currentFile = state.files.currentFile;
            this._currentProject = state.projects.currentProject;
        }
    }
}

window.customElements.define('file-tree', FileTree);
