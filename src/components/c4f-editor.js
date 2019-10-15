import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';

import { changeFile } from 'actions/files';

import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
ace.config.setModuleUrl('ace/mode/javascript_worker', require('file-loader?name=[name].[ext]!ace-builds/src-noconflict/worker-javascript'));
ace.config.setModuleUrl('ace/theme/chrome', require('file-loader?name=[name].[ext]!ace-builds/src-noconflict/theme-chrome'));
ace.config.setModuleUrl('ace/ext/language_tools', require('file-loader?name=[name].[ext]!ace-builds/src-noconflict/ext-language_tools'));

import { FileSystem, filetypes } from 'classes/filesystem.js';

const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());

class C4fEditor extends connect(store)(LitElement) {
    static get properties() {
        return {
            _openedFile: { type: Number },
            _editor: { type: Object },
            _preventOnChange: { type: Boolean },
        };
    }

    static get styles() {
        return [
            sharedStyles,
            css`:host,.ace_editor{height:100%;}`
        ];
    }

    render() {
        return html`<div></div>`;
    }

    firstUpdated() {
        const editor = ace.edit(this.shadowRoot.querySelector('div'), {
            value: "var hello = 'world';" + "\n",
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
            if(this._preventOnChange !== true){
                store.dispatch(changeFile(this._openedFile, this._editor.getValue()));
            }
        }); 

        this._editor = editor;
        this.loadFile(this._openedFile);
    }

    stateChanged(state) {
        if (state.files.opened !== this._openedFile) {
            this._openedFile = state.files.opened;
            this.loadFile(this._openedFile);
        }
    }

    loadFile(fileId) {
        if (this._editor) {
            const state = store.getState();
            this._preventOnChange = true;
            this._editor.session.setValue(state.files.files[fileId].content);
            this._preventOnChange = false;
        }
    }
}

window.customElements.define('c4f-editor', C4fEditor);
