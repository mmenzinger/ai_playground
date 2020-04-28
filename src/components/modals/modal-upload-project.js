import { html, unsafeCSS } from 'lit-element';
import appStore from 'store/app-store.js';
import { LazyElement } from 'components/elements/lazy-element.js';
import db from 'src/localdb.js';
import { defer } from 'src/util.js';
import { ModalAbort } from 'elements/c4f-modal.js';

import JSZip from "jszip";

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./modal-generic.css').toString());

class ModalUploadProject extends LazyElement {
    static get properties() {
        return {
            _error: {type: String },
        }
    }

    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    constructor(){
        super();
        this._error = null;
        this._zip = null;
        this._settings = null;
        this._rendered = defer();
    }

    render() {
        return html`
            <form autocomplete="off" action="javascript:void(0);">
                <header>
                    <h1>Upload Project</h1>
                </header>
                <ul>
                    <li>
                        <label for="file">File</label>
                        <input id="file" type="file">
                    </li>
                    <li>
                        <label for="name">Name</label>
                        <input id="name" type="text" placeholder="My Project">
                    </li>
                    <li>
                        <label>Options</label>
                        <ul class="options">
                            <li>
                                <label for="globals">Include global files</label>
                                <input id="globals" type="checkbox">
                            </li>
                            <li id="collision">
                                <ul class="options">
                                    <li>
                                        <label for="prefer_old">Skip existing files</label>
                                        <input id="prefer_old" type="radio" name="collision" value="old" checked>
                                    </li>
                                    <li>
                                        <label for="prefer_new">Overwrite existing files</label>
                                        <input id="prefer_new" type="radio" name="collision" value="new">
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    ${this._error}
                </ul>
                <footer>
                    <button id="no" @click=${this.onAbort}>Cancel</button>
                    <button id="yes" @click=${this.onSubmit}>Upload</button>
                </footer>
            </form>
            
            
        `;
    }

    async onShow(){
        await this._rendered;
        const file = this.shadowRoot.getElementById('file');
        const name = this.shadowRoot.getElementById('name');
        const globals = this.shadowRoot.getElementById('globals');
        const collision = this.shadowRoot.getElementById('collision');
        name.value = '';
        file.value = null;
        globals.checked = false;
        collision.style.display = 'none';
        file.focus();
    }

    firstUpdated(){
        this._rendered.resolve(true);
        const file = this.shadowRoot.getElementById('file');
        const globals = this.shadowRoot.getElementById('globals');
        file.addEventListener('change', (event) => this.onSelectFile(event.target));
        globals.addEventListener('change', (event) => {
            const display = event.target.checked ? 'block' : 'none';
            this.shadowRoot.getElementById('collision').style.display = display;
        });
    }

    async onSelectFile(target){
        const name = this.shadowRoot.getElementById('name');
        const zipFile = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsArrayBuffer(target.files[0]);
        });
        this._zip = await JSZip.loadAsync(zipFile);
        this._settings = JSON.parse(await this._zip.file('settings.json').async('string'));
        name.value = this._settings.name;
    }

    async onSubmit(){
        try{
            const globals = this.shadowRoot.getElementById('globals');
            const collision = this.shadowRoot.querySelector('input[name="collision"]:checked');
            const name = this.shadowRoot.getElementById('name');

            const projectFilesPromises = [];
            this._zip.folder('project').forEach((filename, file) => {
                projectFilesPromises.push(new Promise((resolve, reject) => {
                    file.async('string').then(content => {
                        resolve({
                            name: filename,
                            content,
                        });
                    });
                }));
            });
            
            const globalFilesPromises = [];
            if(globals.checked){
                this._zip.folder('global').forEach((filename, file) => {
                    globalFilesPromises.push(new Promise((resolve, reject) => {
                        file.async('string').then(content => {
                            resolve({
                                name: filename,
                                content,
                            });
                        });
                    }));
                });
            }

            if(name.value.length === 0)
                throw Error('Empty project name! Every project must have a name.');
            const project = await db.getProjectByName(name.value);
            if(project !== undefined)
                throw Error('Duplicate name! A project with that name already exists!');

            const projectFiles = await Promise.all(projectFilesPromises);
            const globalFiles = await Promise.all(globalFilesPromises);

            const result = {
                projectFiles,
                globalFiles,
                name: name.value,
                collision: collision.value,
                settings: this._settings,
            }
            this._error = null;
            this._zip = null;
            this._settings = null;
            appStore.resolveModal(result);
        }
        catch(error){
        this._error = html`<li class="error"><p>${error}</p></li>`;
        }
    }

    onAbort(){
        this._error = null;
        this._zip = null;
        this._settings = null;
        appStore.rejectModal(new ModalAbort());
    }

    onKeyDown(key){
        switch(key){
            case 'Escape': this.onAbort(); break;
            case 'Enter': this.onSubmit(); break;
        }
    }
}

window.customElements.define('modal-upload-project', ModalUploadProject);
