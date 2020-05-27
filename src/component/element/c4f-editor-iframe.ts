import { html, LitElement } from 'lit-element';
import { autorun } from 'mobx';
import projectStore from '@store/project-store';
import settingsStore from '@store/settings-store';
import { ResizeObserver } from 'resize-observer';
import { Defer, dispatchIframeEvents } from '@util';
import { MonacoWindow } from '@iframe/monaco';

import db from '@localdb';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './c4f-editor.css';

class C4fEditorIframe extends LitElement {
    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }
    _activeFile = null;
    _currentMode = 'plain_text';
    _preventOnChange = false;
    _monaco = new Defer<MonacoWindow>();
    _firstErrorUpdate = true;

    render() {
        this._firstErrorUpdate = true;
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
        const iframe = this.shadowRoot?.getElementById('editor') as HTMLIFrameElement;
        const theme = this.shadowRoot?.getElementById('theme') as HTMLSelectElement;

        iframe.onload = () => {
            const monaco = iframe.contentWindow as MonacoWindow;
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
                if(this._firstErrorUpdate){
                    this._firstErrorUpdate = false;
                    if(projectStore.activeFile){
                        monaco.openFile(projectStore.activeFile);
                    }
                }
                if(projectStore.activeProject){
                    projectStore.updateProjectErrors(projectStore.activeProject.id, fileErrorsList);
                }
            }
            
            monaco.setTheme(theme.options[theme.selectedIndex].value);

            dispatchIframeEvents(iframe);
        }

        theme.onchange = async (_) => {
            const monaco = await this._monaco.promise;
            const selectedTheme = theme.options[theme.selectedIndex].value;
            settingsStore.set('editor-theme', selectedTheme);
            monaco.setTheme(selectedTheme);
        }

        autorun(async _ => {
            const file = projectStore.activeFile;
            if (file) {
                const monaco = await this._monaco.promise;
                monaco.openFile(file);
            }
        });

        autorun(async _ => {
            const project = projectStore.activeProject;
            if(project){
                const monaco = await this._monaco.promise;
                let files = await db.getProjectFiles(project.id);
                files = [...files, ...await db.getProjectFiles(0)]
                monaco.openProject(project, files, projectStore.activeFile || undefined);
            }
        });
    }
}

window.customElements.define('c4f-editor-iframe', C4fEditorIframe);
