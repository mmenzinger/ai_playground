import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { autorun } from 'mobx';
import projectStore from 'store/project-store.js';
import appStore from 'store/app-store.js';
import { defer, dispatchIframeEvents } from 'src/util.js';

import { Modals, ModalAbort } from 'elements/c4f-modal.js';
import { createFileTemplate, deleteFileTemplate } from 'modals/templates.js';

import db from 'src/localdb.js';


const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./file-tree.css').toString());
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
        this._activeFile = null;
        this._fileTree = defer();
    }

    render() {
        return html`<iframe id="filetree" src="iframes/jstree.html"></iframe>`;
    }

    async onDelete(file) {
        try {
            const modal = await appStore.showModal(Modals.GENERIC, deleteFileTemplate(file));
            const selectFile = await db.loadFileByName(this._currentProject, 'index.js');
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
        this.addFile(this._currentProject);
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
                const file = projectStore.activeFile;
                if(project){
                    this._activeFile = file;
                    await this.updateTree();
                }
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
        await fileTree.updateFiles(globalFiles, projectFiles, projectStore.activeFile);
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
