import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from 'src/store.js';
import { ResizeObserver } from 'resize-observer';
import { saveFile } from 'actions/files.js';

import db from '../../localdb.js';

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

const showdown = require('showdown');
const converter = new showdown.Converter();

class C4fEditor extends connect(store)(LitElement) {
    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    constructor() {
        super();
        this._currentFile = {
            id: 0,
            content: '',
        };
        this._currentMode = 'javascript';
        this._lastChange = 0;
        this._preventOnChange = false;
        this._editor = new Promise((resolve, reject) => {
            this.editorLoaded = (editor) => resolve(editor);
        });

        this.gl_settings = JSON.stringify({
            showPopoutIcon: false,
            showMaximiseIcon: false,
            reorderEnabled: false,
            showCloseIcon: false,
        });

        this.gl_content = JSON.stringify([{
            type: 'stack',
            content: [
                {
                    type: 'component',
                    componentName: 'View',
                    isClosable: false,
                },
                {
                    type: 'component',
                    componentName: 'Source',
                    isClosable: false,
                }
            ]
        }]);

        this.gl_components = JSON.stringify([
            {
                name: 'View',
                content: '<div id="markdown"></div>'
            },
            {
                name: 'Source',
                content: '<iframe id="editor" src="iframes/monaco.html"></iframe>`'
            },
        ]);
    }

    render() {
        return html`<iframe id="editor" src="iframes/monaco.html"></iframe>`;
    }

    async firstUpdated() {
        const iframe = this.shadowRoot.querySelector('#editor');

        iframe.onload = () => {
            const editor = iframe.contentWindow.editor;

            editor.onDidChangeModelContent(async (e) => { // TODO: throttle
                if (this._preventOnChange !== true) {
                    this._currentFile.content = editor.getValue();
                    store.dispatch(saveFile(this._currentFile.id, this._currentFile.content)).then(ret => {
                        //console.log(ret);
                    });
                }
            });

            this.editorLoaded(editor);
        
            new ResizeObserver(() => {
                editor.layout();
            }).observe(iframe);
        }
    }

    stateChanged(state) {
        if (state.files.currentFile !== this._currentFile.id) {
            this._currentFile.id = state.files.currentFile;
            this.loadFile(state.files.currentFile).then(() => {
                this.requestUpdate();
            });
        }
    }

    async loadFile(id) {
        if (id > 0) {
            const file = await db.loadFile(id);
            const editor = await this._editor;
            let mode = 'plain_text';
            const ending = file.name.match(/\.([a-z]+)$/);
            if (ending) {
                switch (ending[1]) {
                    case 'js': mode = 'javascript'; break;
                    case 'json': mode = 'json'; break;
                    case 'pl': mode = 'prolog'; break;
                    case 'md': mode = 'markdown'; break;
                    default: mode = '';
                }
            }
            this._currentMode = mode;
            this._currentFile = file;
            
            this._preventOnChange = true;
            editor.setLanguage(mode);
            editor.setValue(file.content);
            this._preventOnChange = false;
        }
    }

    async updateMarkdown(content) {
        /*const layout = await this.shadowRoot.querySelector('#gl').getLayout();
        const element = layout.root.contentItems[0].contentItems[0].element.get()[0];
        const container = element.querySelector('#markdown');
        container.innerHTML = converter.makeHtml(content);*/
    }
}

window.customElements.define('c4f-editor', C4fEditor);
