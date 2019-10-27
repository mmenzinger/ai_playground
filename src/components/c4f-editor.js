import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';

import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import db from '../localdb';
ace.config.setModuleUrl('ace/mode/javascript_worker', require('file-loader?name=[name].[ext]!ace-builds/src-noconflict/worker-javascript'));
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
    }

    render() {
        return html`<div ?hidden=${this._currentFile===0}></div>`;
    }

    firstUpdated() {
        const editor = ace.edit(this.shadowRoot.querySelector('div'), {
            value: "",
            mode: 'ace/mode/javascript',
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
                db.saveFile(this._currentFile, this._editor.getValue()).then(ret => {
                    //console.log(ret);
                });
                //store.dispatch(changeFile(this._currentFile, this._editor.getValue()));
            }
        });

        this._editor = editor;
        //if(this._currentFile > 0)
        //    this.loadFile(this._currentFile);
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
            this._preventOnChange = true;
            db.loadFile(id).then(file => {
                this._editor.session.setValue(file.content);
            }).finally(() => {
                this._preventOnChange = false;
            })
        }
    }
}

window.customElements.define('c4f-editor', C4fEditor);
