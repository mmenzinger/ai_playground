import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from 'src/store.js';
import { ResizeObserver } from 'resize-observer';
import { saveFile } from 'actions/files.js';
import { defer } from 'src/util.js';

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
        return html`<iframe id="editor" src="iframes/monaco.html"></iframe>`;
    }

    async firstUpdated() {
        const iframe = this.shadowRoot.querySelector('#editor');

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

            this._editor.resolve(editor);
        }
    }

    async stateChanged(state) {
        if(state.files.currentFile === undefined){
            if(this._currentFile !== undefined){
                this._currentFile = state.files.currentFile;
                const editor = await this._editor;
                this._preventOnChange = true;
                // TODO prevent editor from checking browser dimensions
                //editor.setLanguage('plain_text');
                //editor.setValue('');
                //editor.updateOptions({ readOnly: true });
                this._preventOnChange = false;
            }
        }
        else if (this._currentFile === undefined || state.files.currentFile.id !== this._currentFile.id) {
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
            editor.setLanguage(mode);
            editor.setValue(this._currentFile.content);
            editor.updateOptions({ readOnly: false });
            this._preventOnChange = false;
        }
    }
}

window.customElements.define('c4f-editor', C4fEditor);
