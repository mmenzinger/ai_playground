import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';

import {openFile} from 'actions/files.js';
//import 'jstree';

const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());
//const jstreeStyles = unsafeCSS(require('jstree/dist/themes/default/style.css').toString());
//const icons32 = require('jstree/dist/themes/default/32px.png');
//const icons40 = require('jstree/dist/themes/default/40px.png');
//const iconsThrobber = require('jstree/dist/themes/default/throbber.gif');

class FileTree extends connect(store)(LitElement) {
    static get properties() {
        return {
            _fileTree: { type: Object },
            _files: { type: Object },
            _parents: { type: Object },
        };
    }
    static get styles() {
        return [
            sharedStyles,
        ];
    }

    render() {
        return this.recRenderTree(this._fileTree);
    }

    onClick(e){
        const fileId = e.target.getAttribute('data-id');
        store.dispatch(openFile(fileId));
    }

    recRenderTree(tree, depth = 0) {
        const elements = [];
        tree.forEach(file => {
            let prefix = ''.padStart(depth * 2, '.');
            let suffix = '';
            if (file.children.length) {
                suffix = this.recRenderTree(file.children, depth + 1);
            }
            elements.push(html`<li>${prefix}<button @click=${this.onClick} data-id=${file.id}>${file.name}</button>${suffix}</li>`);
        });
        return html`<ul>${elements}</ul>`;
    }

    firstUpdated() {
        /*store.dispatch(fileAction.createFile('test', 0, 'content'));
        store.dispatch(fileAction.createFile('testc', 1, 'content2'));
        store.dispatch(fileAction.createFile('testa', 1, 'content2'));
        store.dispatch(fileAction.createFile('testb', 1, 'content2'));
        store.dispatch(fileAction.createFile('test3', 2, 'content3'));
        store.dispatch(fileAction.renameFile(1, 'test1'));
        store.dispatch(fileAction.changeFile(2, 'test2'));*/
        //const tree = $.jstree.create();
        //this.shadowRoot.appendChild(tree);
    }

    stateChanged(state) {
        if (state.files.files !== this._files || state.files.parents !== this._parents){
            const tree = this.recBuildTree(state, 0);
            this._files = state.files.files;
            this._parents = state.files.parents;
            this._fileTree = tree;
        }
    }

    recBuildTree(state, id){
        const files = [];
        for(const [childId, parent] of Object.entries(state.files.parents)){
            if(Number(id) === Number(parent)){
                files.push({
                    id: childId,
                    name: state.files.files[childId].name,
                    children: this.recBuildTree(state, childId),
                });
            }
        }
        return files.sort((a,b) => a.name < b.name ? -1 : 1); // sort ascending by name
    }
}

window.customElements.define('file-tree', FileTree);
