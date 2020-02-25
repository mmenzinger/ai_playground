import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';
import { defer } from 'src/util.js';

//import { modalShow, modalConsume } from 'actions/app.js';
import { openFile, createFile, deleteFile } from 'actions/files.js';
import { showModal } from 'actions/modal.js';

import db from 'src/localdb.js';


const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./file-tree.css').toString());
//const jstreeStyles = unsafeCSS(require('jstree/dist/themes/default/style.css').toString());
//const icons32 = require('jstree/dist/themes/default/32px.png');
//const icons40 = require('jstree/dist/themes/default/40px.png');
//const iconsThrobber = require('jstree/dist/themes/default/throbber.gif');

class FileTree extends connect(store)(LitElement) {
    static get properties() {
        return {
            /*_lastChanged: { type: Number },
            _global: { type: Array },
            _project: { type: Array },
            _currentFile: { type: Number },
            _currentProject: { type: Number },*/
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
        this._filetree = defer();
    }

    render() {
        /*const globalFiles = [];
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
        return html`<ul class="folders">${global}${project}</ul><div id="jstree"></div>`;*/
        return html`<iframe id="filetree" src="iframes/jstree.html"></iframe>`;
        //return html`<div id="jstree"></div>`;
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
            this.updateTree();
        }
        catch (error) {
            console.error(error);
        }
    }

    onFile(file) {
        store.dispatch(openFile(file.id));
    }

    onAddFileGlobal() {
        this.addFile(0).then(this.updateTree.bind(this));
    }

    onAddFileProject() {
        const state = store.getState();
        const project = state.projects.currentProject;
        this.addFile(project).then(this.updateTree.bind(this));
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
                            <option value="md">.md</option>
                        </select>
                    </form>
                `,
                submit: 'Create File',
                abort: 'Cancel',
                check: async (fields) => {
                    if (fields.name.length === 0)
                        return Error('Empty filename! Every file must have a name.');
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

    async firstUpdated() {
        const iframe = this.shadowRoot.getElementById('filetree');
        iframe.onload = async () => {
            this._filetree.resolve(iframe.contentWindow);
            await this.updateTree();
            const filetree = await this._filetree;
            filetree.onFile = this.onFile.bind(this);
            filetree.onAddFileGlobal = this.onAddFileGlobal.bind(this);
            filetree.onAddFileProject = this.onAddFileProject.bind(this);
            filetree.onDelete = this.onDelete.bind(this);
        }
    }

    async stateChanged(state) {
        if (state.files.lastChangeFileTree !== this._lastChanged 
            || state.files.currentFile !== this._currentFile
            || state.projects.currentProject !== this._currentProject) {
            this._lastChanged = state.files.lastChangeFileTree;
            //const filetree = await this._filetree;
            //const project = state.projects.currentProject;
            /*db.getProjectFiles(project).then((files) => {
                this._project = files.sort((a,b) => a.name.localeCompare(b.name));
            });
            db.getProjectFiles(0).then((files) => {
                this._global = files.sort((a,b) => a.name.localeCompare(b.name));
            });*/
            //let project = await db.getProjectFiles(state.projects.currentProject);
            //let global = await db.getProjectFiles(0);
            //this._updateTree();
            this._currentFile = state.files.currentFile;
            this._currentProject = state.projects.currentProject;
        }
    }

    async updateTree() {
        const state = store.getState();
        let filetree, project, global;
        [filetree, project, global] = await Promise.all([
            this._filetree,
            db.getProjectFiles(state.projects.currentProject),
            db.getProjectFiles(0),
        ]);
        project = project.sort((a,b) => a.name.localeCompare(b.name));
        global = global.sort((a,b) => a.name.localeCompare(b.name));
        await filetree.updateFiles(global, project, state.files.currentFile);
    }
}

window.customElements.define('file-tree', FileTree);
