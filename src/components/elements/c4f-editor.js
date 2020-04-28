import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { autorun } from 'mobx';
import projectStore from 'store/project-store.js';
import settingsStore from 'store/settings-store.js';
import { ResizeObserver } from 'resize-observer';
import { defer, dispatchIframeEvents } from 'src/util.js';


const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./c4f-editor.css').toString());

class C4fEditor extends LitElement {
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
        this._editor = defer();
    }

    render() {
        const theme = settingsStore.get('editor-theme', 'vs');
        return html`
            <iframe id="editor" src="iframes/monaco.html"></iframe>
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
            const editor = iframe.contentWindow.editor;

            editor.onDidChangeModelContent(_ => {
                if(projectStore.activeFile){
                    const content = editor.getValue();
                    projectStore.saveFile(projectStore.activeFile.id, content);
                }
            });

            new ResizeObserver(() => {
                editor.layout();
            }).observe(iframe);

            editor.setTheme(theme.options[theme.selectedIndex].value);

            this._editor.resolve(editor);

            dispatchIframeEvents(iframe);
        }

        theme.onchange = async (e) => {
            const editor = await this._editor;
            const selectedTheme = theme.options[theme.selectedIndex].value;
            settingsStore.set('editor-theme', selectedTheme);
            editor.setTheme(selectedTheme);
        }

        autorun(async reaction => {
            projectStore.flushActiveFile();
            const file = projectStore.activeFile;
            if (file) {
                const editor = await this._editor;
                let mode = 'plain_text';
                const ending = file.name.match(/\.([a-z]+)$/);
                if (ending) {
                    switch (ending[1]) {
                        case 'js': mode = 'javascript'; break;
                        case 'json': mode = 'json'; break;
                        case 'pl': mode = 'prolog'; break;
                        case 'md': mode = 'markdown'; break;
                    }
                }
                this._currentMode = mode;
                this._preventOnChange = true;
                editor.onErrorMarkerChange((markers) => {
                    const errors = markers.map(marker => ({
                        line: marker.startLineNumber,
                        column: marker.startColumn,
                        message: marker.message,
                    }));
                    projectStore.setFileErrors(file.id, errors);
                });
                editor.setLanguage(mode);
                editor.setValue(file.content);
                //editor.updateOptions({ readOnly: false });
                if(file.state){
                    const lineNumber = file.state.cursor.line;
                    const column = file.state.cursor.column;
                    editor.setPosition({column, lineNumber});
                    editor.revealLineInCenter(lineNumber);
                    editor.focus();
                }
                this._preventOnChange = false;
            }
        });
    }
}

window.customElements.define('c4f-editor', C4fEditor);
