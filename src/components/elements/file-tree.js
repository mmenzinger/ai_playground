import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { autorun, trace, toJS } from 'mobx';
import projectStore from 'store/project-store.js';
import appStore from 'store/app-store.js';
import { defer, dispatchIframeEvents } from 'src/util.js';

import { Modals, ModalAbort } from 'elements/c4f-modal.js';
import { createFileTemplate, deleteFileTemplate } from 'modals/templates.js';

import db from 'src/localdb.js';


import sharedStyles from 'components/shared-styles.css';
import style from './file-tree.css';
//const jstreeStyles = unsafeCSS(require('jstree/dist/themes/default/style.css').toString());
//const icons32 = require('jstree/dist/themes/default/32px.png');
//const icons40 = require('jstree/dist/themes/default/40px.png');
//const iconsThrobber = require('jstree/dist/themes/default/throbber.gif');

class FileTree extends LitElement {
    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    constructor() {
        super();
        this._fileTree = defer();
    }

    render() {
        return html`<iframe id="filetree" src="iframes/jstree.html"></iframe>`;
    }

    async onDelete(file) {
        try {
            const modal = await appStore.showModal(Modals.GENERIC, deleteFileTemplate(file));
            const selectFile = await db.loadFileByName(projectStore.activeProject.id, 'index.js');
            console.log(selectFile)
            await projectStore.openFile(selectFile.id);
            await projectStore.deleteFile(file.id);
        }
        catch (error) {
            if( ! (error instanceof ModalAbort) )
                console.error(error);
        }
    }

    onFile(file) {
        projectStore.openFile(file.id);
    }

    onAddFileGlobal() {
        this.addFile(0);
    }

    onAddFileProject() {
        this.addFile(projectStore.activeProject.id);
    }

    async addFile(project) {
        try {
            const modal = await appStore.showModal(Modals.GENERIC, createFileTemplate(project));
            const id = await projectStore.createFile(`${modal.name}.${modal.type}`, project, '');
            projectStore.openFile(id);
        }
        catch (error) {
            if( ! (error instanceof ModalAbort) )
                console.error(error);
        }
    }

    async firstUpdated() {
        const iframe = this.shadowRoot.getElementById('filetree');
        iframe.onload = async () => {
            this._fileTree.resolve(iframe.contentWindow)
            const fileTree = await this._fileTree;
            fileTree.onFile = this.onFile.bind(this);
            fileTree.onAddFileGlobal = this.onAddFileGlobal.bind(this);
            fileTree.onAddFileProject = this.onAddFileProject.bind(this);
            fileTree.onDelete = this.onDelete.bind(this);
            dispatchIframeEvents(iframe);

            autorun(async reaction => {
                const project = projectStore.activeProject;
                if(project){
                    await this.updateTree();
                }
            });

            autorun(async reaction => {
                const file = projectStore.activeFile;
                if(file){
                    await fileTree.selectFile(file);
                }
            });

            autorun(async reaction => {
                const errors = toJS(projectStore.activeProject.errors) || {};
                for(let value of Object.values(errors)){
                    value = value.message;
                }
                await fileTree.setErrors(errors);
            });
        }
    }

    async updateTree() {
        let fileTree, projectFiles, globalFiles;
        [fileTree, projectFiles, globalFiles] = await Promise.all([
            this._fileTree,
            projectStore.activeProject ? db.getProjectFiles(projectStore.activeProject.id) : [],
            db.getProjectFiles(0),
        ]);
        projectFiles = projectFiles.sort(this.sort);
        globalFiles = globalFiles.sort(this.sort);
        const errors = projectStore.activeErrors || [];
        await fileTree.updateFiles(globalFiles, projectFiles, projectStore.activeFile, this.getFilesError(errors));
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

    getFilesError(errors){
        const filesError = {};
        errors.forEach(error => {
            filesError[error.caller.fileId] = error.args[0];
        });
        return filesError;
    }
}

window.customElements.define('file-tree', FileTree);
