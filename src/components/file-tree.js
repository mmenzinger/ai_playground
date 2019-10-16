import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';

//import { modalShow, modalConsume } from 'actions/app.js';
import { openFile, createFile, deleteFile } from 'actions/files.js';
import { showModal } from 'actions/modal.js';

import db from 'src/localdb.js';


const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());
//const jstreeStyles = unsafeCSS(require('jstree/dist/themes/default/style.css').toString());
//const icons32 = require('jstree/dist/themes/default/32px.png');
//const icons40 = require('jstree/dist/themes/default/40px.png');
//const iconsThrobber = require('jstree/dist/themes/default/throbber.gif');

class FileTree extends connect(store)(LitElement) {
    static get properties() {
        return {
            //_lastChanged: { type: Number },
            _global: { type: Array },
            _project: { type: Array },
        };
    }
    static get styles() {
        return [
            sharedStyles,
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
            globalFiles.push(html`
                <li>
                    <button @click=${e=> { this.onFile(file.id) }}>${file.name}</button>
                    <button @click=${e=> { this.onDelete(file.id) }}>-</button>
                </li>
            `);
        });
        const global = html`
            <li>global:<br>
                <ul>${globalFiles}</ul>
                <button @click=${this.onAddFileGlobal}>Add</button>
            </li>
        `;
        const projectFiles = [];
        this._project.forEach(file => {
            projectFiles.push(html`
                <li>
                    <button @click=${e=> { this.onFile(file.id) }}>${file.name}</button>
                    <button @click=${e=> { this.onDelete(file.id) }}>-</button>
                </li>
            `);
        });
        const project = html`
            <li>project:<br>
                <ul>${projectFiles}</ul>
                <button @click=${this.onAddFileProject}>Add</button>
            </li>
        `;
        return html`${[global, project]}`;
    }

    async onDelete(id) {
        try {
            const state = store.getState();
            const project = Number(state.app.params[0]);
            const num = await db.removeFile(id);
            if (num === 1) {
                store.dispatch(deleteFile(id));
            }
            db.getFiles(0).then((files) => {
                this._global = files;
            });
            db.getFiles(project).then((files) => {
                this._project = files;
            });
        }
        catch (error) {
            console.error(error);
        }

    }

    onFile(id) {
        store.dispatch(openFile(id));
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
                fields: [{ id: 'name', type: 'text', placeholder: 'filename.js' }],
                submit: 'Create File',
                abort: 'Cancel',
            }));
            await db.createFile(modal.name, project, '');
            db.getFiles(project).then((files) => {
                if(project === 0)
                    this._global = files;
                else
                    this._project = files;
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    firstUpdated() {
        const state = store.getState();
        const project = Number(state.app.params[0]);
        db.getFiles(0).then((files) => {
            this._global = files;
        });
        db.getFiles(project).then((files) => {
            this._project = files;
        });
    }

    stateChanged(state) {
        /*const result = state.app.modalResult;
        if(result !== undefined && result.type === 'addGlobalFile'){
            store.dispatch(modalConsume());
            if(result.success === true){
                db.createFile(result.fields.filename, 0, '').then((id) => {
                    store.dispatch(createFile());
                });
            }
        }*/
        /*if (state.files.lastChanged !== this._lastChanged) {
            this._lastChanged = state.files.lastChanged;
            db.getFiles(state.app.currentProject).then((files) => {
                this._global = files;
            });*/
        /*this._global = [];
        for(const fileId of state.files.projects.get(0).files){
            this._global.push(state.files.files.get(fileId));
        }*/
        //this._project = state.files.projects.get(state.files.currentProject);
        //}
    }
}

window.customElements.define('file-tree', FileTree);
