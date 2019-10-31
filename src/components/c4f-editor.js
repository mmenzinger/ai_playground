import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from 'src/store';
import { ResizeObserver } from 'resize-observer';
import { saveFile } from 'actions/files';

import db from '../localdb';



import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-plain_text';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-prolog';
ace.config.setModuleUrl('ace/mode/javascript_worker', require('file-loader?name=[name].[ext]!ace-builds/src-noconflict/worker-javascript'));
ace.config.setModuleUrl('ace/mode/json_worker', require('file-loader?name=[name].[ext]!ace-builds/src-noconflict/worker-json'));
ace.config.setModuleUrl('ace/theme/chrome', require('file-loader?name=[name].[ext]!ace-builds/src-noconflict/theme-chrome'));
ace.config.setModuleUrl('ace/ext/language_tools', require('file-loader?name=[name].[ext]!ace-builds/src-noconflict/ext-language_tools'));

const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());

class C4fEditor extends connect(store)(LitElement) {
    static get properties() {
        return {
            _currentFile: { type: Number },
            _lastChange: { type: Number },
        };
    }

    static get styles() {
        return [
            sharedStyles,
            css`:host,.ace_editor{height:100%;}`
        ];
    }

    constructor() {
        super();
        this._currentFile = 0;
        this._lastChange = 0;
        this._preventOnChange = false;
        this._editor = undefined;

        this._resizeObserver = new ResizeObserver(() => {
            this._editor.resize();
        });
    }

    render() {
        return html`<div ?hidden=${this._currentFile === 0}></div>`;
    }

    firstUpdated() {
        const container = this.shadowRoot.querySelector('div');
        const editor = ace.edit(container, {
            value: '',
            //mode: 'ace/mode/javascript',
        });
        editor.renderer.attachToShadowRoot();

        editor.setTheme('ace/theme/chrome');

        ace.config.loadModule('ace/ext/language_tools', () => {
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
            });
        });

        editor.session.on('change', () => { // TODO: throttle
            if (this._preventOnChange !== true) {
                store.dispatch(saveFile(this._currentFile, this._editor.getValue())).then(ret => {
                    //console.log(ret);
                });
            }
        });

        this._editor = editor;
        this._resizeObserver.observe(container);

        if(this._currentFile > 0)
            this.loadFile(this._currentFile);
    }

    stateChanged(state) {
        if (state.files.currentFile !== this._currentFile
            || (state.files.lastChangeFileContent !== this._lastChange
                && state.files.lastChangeFileId === this._currentFile
            )
        ) {
            this._currentFile = state.files.currentFile;
            this.loadFile(this._currentFile);
        }
    }

    loadFile(id) {
        if (this._editor && id > 0) {
            db.loadFile(id).then(file => {
                let mode = 'plain_text';
                const ending = file.name.match(/\.([a-z]+)$/);
                if (ending) {
                    switch (ending[1]) {
                        case 'js': mode = 'javascript'; break;
                        case 'json': mode = 'json'; break;
                        case 'pl': mode = 'prolog'; break;
                        default: mode = 'plain_text';
                    }
                }
                this._preventOnChange = true;
                this._editor.session.setMode(`ace/mode/${mode}`);
                this._editor.session.setValue(file.content);
                this._preventOnChange = false;
            });
        }
    }
}

window.customElements.define('c4f-editor', C4fEditor);
