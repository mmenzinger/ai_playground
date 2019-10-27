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
            _lastChanged: { type: Number },
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
            await store.dispatch(deleteFile(id));
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
            const id = await store.dispatch(createFile(modal.name, project, ''));
        }
        catch (error) {
            console.error(error);
        }
    }

    firstUpdated() {
    }

    stateChanged(state) {
        if (state.files.lastChangeFileTree !== this._lastChanged) {
            this._lastChanged = state.files.lastChangeFileTree;

            const project = Number(state.app.params[0]);
            db.getFiles(project).then((files) => {
                this._project = files;
            });
            db.getFiles(0).then((files) => {
                this._global = files;
            });
        }
    }
}

window.customElements.define('file-tree', FileTree);
