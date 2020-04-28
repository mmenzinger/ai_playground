import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from 'src/store.js';
import { ResizeObserver } from 'resize-observer';
import { saveFile, setFileErrors } from 'actions/files.js';
import { defer, dispatchIframeEvents } from 'src/util.js';
import settings from 'src/settings.js';

/*import ace from 'ace-builds/src-min-noconflict/ace.js';
import 'ace-builds/src-noconflict/mode-plain_text';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-prolog';
import 'ace-builds/src-noconflict/mode-markdown';
ace.config.setModuleUrl('ace/mode/javascript_worker', require('file-loader?name=ace/[name].[ext]!ace-builds/src-min-noconflict/worker-javascript'));
ace.config.setModuleUrl('ace/mode/json_worker', require('file-loader?name=ace/[name].[ext]!ace-builds/src-min-noconflict/worker-json'));
ace.config.setModuleUrl('ace/theme/chrome', require('file-loader?name=ace/[name].[ext]!ace-builds/src-min-noconflict/theme-chrome'));
ace.config.setModuleUrl('ace/ext/language_tools', require('file-loader?name=ace/[name].[ext]!ace-builds/src-min-noconflict/ext-language_tools'));*/

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./c4f-editor.css').toString());



class C4fEditor extends connect(store)(LitElement) {
    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    constructor() {
        super();
        this._currentFile = undefined;
        this._currentMode = 'plain_text';
        this._preventOnChange = false;
        this._editor = defer();
    }

    render() {
        const theme = settings.get('editor-theme', 'vs');
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

            editor.onDidChangeModelContent(async (e) => { // TODO: throttle
                if (this._currentFile && this._preventOnChange !== true) {
                    this._currentFile.content = editor.getValue();
                    store.dispatch(saveFile(this._currentFile.id, this._currentFile.content)).then(ret => {
                        //console.log(ret);
                    });
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
            settings.set('editor-theme', selectedTheme);
            editor.setTheme(selectedTheme);
        }
    }

    async stateChanged(state) {
        if(!state.files.currentFile){
            if(this._currentFile){
                this._currentFile = state.files.currentFile;
                //const editor = await this._editor;
                //this._preventOnChange = true;
                // TODO prevent editor from checking browser dimensions
                //editor.setLanguage('plain_text');
                //editor.setValue('');
                //editor.updateOptions({ readOnly: true });
                //this._preventOnChange = false;
            }
        }
        else if (!this._currentFile || state.files.currentFile.id !== this._currentFile.id) {
            this._currentFile = state.files.currentFile;
            const editor = await this._editor;
            let mode = 'plain_text';
            const ending = this._currentFile.name.match(/\.([a-z]+)$/);
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
            const fileId = this._currentFile.id;
            editor.onErrorMarkerChange((markers) => {
                const errors = markers.map(marker => ({
                    line: marker.startLineNumber,
                    column: marker.startColumn,
                    message: marker.message,
                }));
                store.dispatch(setFileErrors(fileId, errors));
            });
            editor.setLanguage(mode);
            editor.setValue(this._currentFile.content);
            //editor.updateOptions({ readOnly: false });
            if(this._currentFile.state){
                const lineNumber = this._currentFile.state.cursor.line;
                const column = this._currentFile.state.cursor.column;
                editor.setPosition({column, lineNumber});
                editor.revealLineInCenter(lineNumber);
                editor.focus();
            }
            this._preventOnChange = false;
            
        }
    }
}

window.customElements.define('c4f-editor', C4fEditor);
