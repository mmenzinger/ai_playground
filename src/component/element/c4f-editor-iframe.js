import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { autorun } from 'mobx';
import projectStore from '@store/project-store';
import settingsStore from '@store/settings-store';
import { ResizeObserver } from 'resize-observer';
import { Defer, dispatchIframeEvents } from '@util';


import sharedStyles from '@shared-styles';
import style from './c4f-editor.css';

class C4fEditorIframe extends LitElement {
    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    constructor() {
        super();
        this._activeFile = null;
        this._currentMode = 'plain_text';
        this._preventOnChange = false;
        this._monaco = new Defer();
    }

    render() {
        const theme = settingsStore.get('editor-theme', 'vs');
        return html`
            <iframe id="editor" src="monaco.html"></iframe>
            <select id="theme">
                <option value="vs" ?selected="${theme === 'vs'}">Light</option>
                <option value="vs-dark" ?selected="${theme === 'vs-dark'}">Dark</option>
                <option value="hc-black" ?selected="${theme === 'hc-black'}">High Contrast</option>
            </select>
        `;
    }

    async firstUpdated() {
        const iframe = this.shadowRoot.getElementById('editor');
        const theme = this.shadowRoot.getElementById('theme');

        iframe.onload = () => {
            const monaco = iframe.contentWindow;
            this._monaco.resolve(monaco);

            new ResizeObserver(() => {
                monaco.resize();
            }).observe(iframe);

            monaco.onContentChange = (fileId, content) => {
                projectStore.saveFileContent(fileId, content);
            }

            monaco.onStateChange = (fileId, state) => {
                projectStore.saveFileState(fileId, state);
            }

            monaco.onErrorChange = (fileErrorsList) => {
                /*console.log(fileErrorsList)
                for(const fileErrors of fileErrorsList){
                    projectStore.saveFileErrors(fileErrors.fileId, fileErrors.errors);
                }*/
                projectStore.updateProjectErrors(projectStore.activeProject.id, fileErrorsList);
            }
            
            monaco.setTheme(theme.options[theme.selectedIndex].value);

            dispatchIframeEvents(iframe);
        }

        theme.onchange = async (e) => {
            const monaco = await this._monaco.promise;
            const selectedTheme = theme.options[theme.selectedIndex].value;
            settingsStore.set('editor-theme', selectedTheme);
            monaco.setTheme(selectedTheme);
        }

        autorun(async reaction => {
            const file = projectStore.activeFile;
            if (file) {
                const monaco = await this._monaco.promise;
                monaco.openFile(file);
            }
        });
    }
}

window.customElements.define('c4f-editor-iframe', C4fEditorIframe);
