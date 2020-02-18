import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from 'src/store.js';
import { ResizeObserver } from 'resize-observer';
import { saveFile } from 'actions/files.js';

import db from '../localdb.js';

import ace from 'ace-builds/src-min-noconflict/ace.js';
import 'ace-builds/src-noconflict/mode-plain_text';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-prolog';
import 'ace-builds/src-noconflict/mode-markdown';
ace.config.setModuleUrl('ace/mode/javascript_worker', require('file-loader?name=ace/[name].[ext]!ace-builds/src-min-noconflict/worker-javascript'));
ace.config.setModuleUrl('ace/mode/json_worker', require('file-loader?name=ace/[name].[ext]!ace-builds/src-min-noconflict/worker-json'));
ace.config.setModuleUrl('ace/theme/chrome', require('file-loader?name=ace/[name].[ext]!ace-builds/src-min-noconflict/theme-chrome'));
ace.config.setModuleUrl('ace/ext/language_tools', require('file-loader?name=ace/[name].[ext]!ace-builds/src-min-noconflict/ext-language_tools'));

const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());
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
        this._lastChange = 0;
        this._preventOnChange = false;
        this._editor = undefined;
        this._currentMode = 'plain_text';

        this._resizeObserver = new ResizeObserver(() => {
            this._editor.resize();
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
                content: '<div id="editor"></div>'
            },
        ]);
    }

    render() {
        if (this._currentFile.id > 0) {
            if(this._currentMode === 'markdown'){
                return html`
                    <golden-layout id="gl" content=${this.gl_content} components=${this.gl_components} settings=${this.gl_settings}></golden-layout>
                `;
            }
            else {
                return html`<div id="editor"></div>`;
            }
        }
        else{
            return html``;
        }
    }

    async updated() {
        if (this._currentFile.id > 0) {
            let container = this.shadowRoot.querySelector('#editor');
            if (this._currentMode === 'markdown') {
                const gl = await this.shadowRoot.querySelector('#gl').getLayout();
                const element = gl.root.contentItems[0].contentItems[1].element.get()[0];
                container = element.querySelector('#editor');
            }
            const editor = ace.edit(container, {
                value: '',
            });
            editor.renderer.attachToShadowRoot();

            editor.setTheme('ace/theme/chrome');

            ace.config.loadModule('ace/ext/language_tools', () => {
                editor.setOptions({
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                });
            });

            editor.session.on('change', async () => { // TODO: throttle
                if (this._preventOnChange !== true) {
                    this._currentFile.content = this._editor.getValue();
                    store.dispatch(saveFile(this._currentFile.id, this._currentFile.content)).then(ret => {
                        //console.log(ret);
                    });
                    if (this._currentMode === 'markdown') {
                        this.updateMarkdown(this._currentFile.content);
                    }
                }
            });

            this._editor = editor;
            this._resizeObserver.observe(container);

            this._preventOnChange = true;
            this._editor.session.setMode(`ace/mode/${this._currentMode}`);
            this._editor.session.setValue(this._currentFile.content);
            this._preventOnChange = false;
            if (this._currentMode === 'markdown') {
                await this.updateMarkdown(this._currentFile.content);
            }
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
            let mode = 'plain_text';
            const ending = file.name.match(/\.([a-z]+)$/);
            if (ending) {
                switch (ending[1]) {
                    case 'js': mode = 'javascript'; break;
                    case 'json': mode = 'json'; break;
                    case 'pl': mode = 'prolog'; break;
                    case 'md': mode = 'markdown'; break;
                    default: mode = 'plain_text';
                }
            }
            this._currentMode = mode;
            this._currentFile = file;
        }
    }

    async updateMarkdown(content) {
        const layout = await this.shadowRoot.querySelector('#gl').getLayout();
        const element = layout.root.contentItems[0].contentItems[0].element.get()[0];
        const container = element.querySelector('#markdown');
        container.innerHTML = converter.makeHtml(content);
    }
}

window.customElements.define('c4f-editor', C4fEditor);
