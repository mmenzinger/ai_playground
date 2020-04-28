import { html, unsafeCSS } from 'lit-element';
import { LazyElement } from 'components/elements/lazy-element.js';
import { autorun } from 'mobx';
import projectStore from 'store/project-store.js';

import { defer } from 'src/util.js';

import 'components/elements/dynamic-split.js';
import 'components/elements/tab-group.js';
import 'components/elements/file-tree.js';
import 'components/elements/c4f-editor.js';
import 'components/elements/ai-simulator.js';
import 'components/elements/c4f-console.js';
import 'components/elements/c4f-markdown.js';

class AiProject extends LazyElement {
    constructor(){
        super();
        this._activeFile = { id: null };
        this._editorTabGroup = defer();
    }

    render() {
        return html`
            <dynamic-split direction="horizontal" minSize="200px" defaultRatio="0.6" saveId="project_simulation">
                <dynamic-split slot="start" direction="vertical" minSize="50px" defaultRatio="0.8" saveId="project_console">
                    <dynamic-split slot="start" direction="horizontal" minSize="100px" defaultRatio="0.3" saveId="project_files_editor">
                        <file-tree slot="start"></file-tree>
                        <tab-group slot="end" id="editorTabGroup">
                            <c4f-editor name="Editor"></c4f-editor>
                            <c4f-markdown name="Markdown"></c4f-markdown>
                        </tab-group>
                    </dynamic-split>
                    <c4f-console slot="end"></c4f-console>
                </dynamic-split>
                <tab-group slot="end">
                    <ai-simulator name="Simulation"></ai-simulator>
                    <c4f-markdown name="Markdown"></c4f-markdown>
                </tab-group>
            </dynamic-split>
        `;
    }

    firstUpdated() {
        const tabGroup = this.shadowRoot.getElementById('editorTabGroup');
        this._editorTabGroup.resolve(tabGroup);

        autorun(async reaction => {
            const activeFile = projectStore.activeFile
            if(activeFile && activeFile !== this._activeFile.id){
                const tabGroup = await this._editorTabGroup;
                if(activeFile.name.endsWith('.md')){
                    tabGroup.select('Markdown');
                }
                else{
                    tabGroup.select('Editor');
                }
                this._activeFile = activeFile;
            }
        });
    }

    async stateChanged(state) {
        if(state.files.currentFile && state.files.currentFile.id !== this._currentFile.id)
        {
            this._currentFile = state.files.currentFile;
            const tabGroup = await this._editorTabGroup;
            if(this._currentFile.name.endsWith('.md')){
                tabGroup.select('Markdown');
            }
            else{
                tabGroup.select('Editor');
            }
        }
    }
}

window.customElements.define('ai-project', AiProject);
