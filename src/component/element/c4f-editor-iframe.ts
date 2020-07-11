import { html, LitElement } from 'lit-element';
import { reaction } from 'mobx';
import projectStore from '@store/project-store';
import settingsStore from '@store/settings-store';
import { ResizeObserver } from 'resize-observer';
import { Defer, dispatchIframeEvents } from '@util';
import { MonacoWindow } from '@iframe/monaco';
import { Project, File } from '@store/types';

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
    #monaco = new Defer<MonacoWindow>();
    #firstErrorUpdate = true;

    render() {
        this.#firstErrorUpdate = true;
        const theme = settingsStore.get('editor-theme', 'vs');
        const wrap = settingsStore.get('editor-wordwrap', false);
        return html`
            <iframe id="editor" src="monaco.html"></iframe>
            <ul id="menu">
                <li>
                    <input type="checkbox" id="wordwrap" ?checked=${wrap}>
                    <label for="wordwrap">word wrap</label>
                </li>
                <li>
                    <select id="theme">
                        <option value="vs" ?selected="${theme === 'vs'}">Light</option>
                        <option value="vs-dark" ?selected="${theme === 'vs-dark'}">Dark</option>
                        <option value="hc-black" ?selected="${theme === 'hc-black'}">High Contrast</option>
                    </select>
                </li>
            </ul>
            <div id="preview" style="display:none"></div>
        `;
    }

    async firstUpdated() {
        const iframe = this.shadowRoot?.getElementById('editor') as HTMLIFrameElement;
        const theme = this.shadowRoot?.getElementById('theme') as HTMLSelectElement;
        const wordwrap = this.shadowRoot?.getElementById('wordwrap') as HTMLInputElement;

        iframe.onload = () => {
            const monaco = iframe.contentWindow as MonacoWindow;
            this.#monaco.resolve(monaco);

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
                if(this.#firstErrorUpdate){
                    this.#firstErrorUpdate = false;
                    if(projectStore.activeFile){
                        monaco.openFile(projectStore.activeFile);
                    }
                }
                if(projectStore.activeProject){
                    projectStore.updateProjectErrors(projectStore.activeProject.id, fileErrorsList);
                }
            }
            
            monaco.setTheme(theme.options[theme.selectedIndex].value);
            monaco.setWordWrap(wordwrap.checked);

            dispatchIframeEvents(iframe);
        }

        theme.onchange = async (_) => {
            const monaco = await this.#monaco.promise;
            const selectedTheme = theme.options[theme.selectedIndex].value;
            settingsStore.set('editor-theme', selectedTheme);
            monaco.setTheme(selectedTheme);
        }

        wordwrap.onchange = async (_) => {
            const monaco = await this.#monaco.promise;
            settingsStore.set('editor-wordwrap', wordwrap.checked);
            monaco.setWordWrap(wordwrap.checked);
        }

        let project: Project;
        let file: File;
        reaction(
            () => ({
                activeProject: projectStore.activeProject,
                activeFile: projectStore.activeFile,
            }),
            async (data, _) => {
                if(data.activeProject !== project){
                    const monaco = await this.#monaco.promise;
                    if(data.activeProject){
                        project = data.activeProject;
                        let files = await db.getProjectFiles(project.id);
                        files = [...files, ...await db.getProjectFiles(0)].filter(file => !(file.content instanceof Blob));
                        monaco.openProject(project, files);
                    }
                    else{
                        monaco.closeProject();
                    }
                }
                if (data.activeFile !== file && data.activeFile) {
                    file = data.activeFile;
                    const editor = this.shadowRoot?.getElementById('editor') as HTMLElement;
                    const menu = this.shadowRoot?.getElementById('menu') as HTMLElement;
                    const preview = this.shadowRoot?.getElementById('preview') as HTMLElement;
                    const monaco = await this.#monaco.promise;
                    if(/\.(png|jpe?g)$/.test(file.name)){
                        editor.style.display = 'none';
                        menu.style.display = 'none';
                        preview.style.display = 'block';
                        preview.innerHTML = `<img src="/${file.projectId}/${file.name}">`;
                    }
                    else{
                        editor.style.display = 'block';
                        menu.style.display = 'flex';
                        preview.style.display = 'none';
                        monaco.openFile(file);
                    }
                }
            },
            {
                fireImmediately: true,
            }
        );
    }
}

window.customElements.define('c4f-editor-iframe', C4fEditorIframe);
