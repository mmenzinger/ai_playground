import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';
import { defer, dispatchIframeMouseEvents } from 'src/util.js';

//import { modalShow, modalConsume } from 'actions/app.js';
import { openFile, createFile, deleteFile } from 'actions/files.js';
import { showModal } from 'actions/modal.js';

import { Modals, ModalAbort } from 'elements/c4f-modal.js';
import { createFileTemplate, deleteFileTemplate } from 'modals/templates.js';

import db from 'src/localdb.js';


const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./file-tree.css').toString());
//const jstreeStyles = unsafeCSS(require('jstree/dist/themes/default/style.css').toString());
//const icons32 = require('jstree/dist/themes/default/32px.png');
//const icons40 = require('jstree/dist/themes/default/40px.png');
//const iconsThrobber = require('jstree/dist/themes/default/throbber.gif');

class FileTree extends connect(store)(LitElement) {
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
        this._currentFile = { id: 0 };
        this._currentProject = 0;
    }

    render() {
        return html`<iframe id="filetree" src="iframes/jstree.html"></iframe>`;
    }

    async onDelete(file) {
        try {
            const modal = await store.dispatch(showModal(Modals.GENERIC, deleteFileTemplate(file)));
            await store.dispatch(deleteFile(file.id));
            this.updateTree();
        }
        catch (error) {
            if( ! (error instanceof ModalAbort) )
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
            const modal = await store.dispatch(showModal(Modals.GENERIC, createFileTemplate(project)));
            const id = await store.dispatch(createFile(`${modal.name}.${modal.type}`, project, ''));
        }
        catch (error) {
            if( ! (error instanceof ModalAbort) )
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

            dispatchIframeMouseEvents(iframe);
        }
    }

    async stateChanged(state) {
        if(state.projects.currentProject !== this._currentProject){
            this._currentProject = state.projects.currentProject;
            await this.updateTree();
        }
        if (state.files.currentFile && state.files.currentFile.id !== this._currentFile.id) {
            //console.log(this._currentFile, state.files.currentFile)
            this._currentFile = state.files.currentFile;
            const filetree = await this._filetree;
            await filetree.selectFile(this._currentFile);
        }
    }

    async updateTree() {
        const state = store.getState();
        let filetree, project, global;
        [filetree, project, global] = await Promise.all([
            this._filetree,
            state.projects.currentProject ? db.getProjectFiles(state.projects.currentProject) : [],
            db.getProjectFiles(0),
        ]);
        project = project.sort(this.sort);
        global = global.sort(this.sort);
        await filetree.updateFiles(global, project, state.files.currentFile);
    }

    sort(fileA, fileB) {
        // sort first by file endings, then by name
        const endingA = fileA.name.split('.').pop();
        const endingB = fileB.name.split('.').pop();
        let comp = endingA.localeCompare(endingB);
        if( comp === 0 ){
            comp = fileA.name.localeCompare(fileB.name);
        }
        return comp;
    }
}

window.customElements.define('file-tree', FileTree);
