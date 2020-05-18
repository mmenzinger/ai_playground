import { html, unsafeCSS } from 'lit-element';
import { LazyElement } from '@element/lazy-element';
import { autorun } from 'mobx';
import projectStore from '@store/project-store';

import { Defer } from '@util';

import '@element/dynamic-split';
import '@element/tab-group';
import '@element/file-tree';
import '@element/c4f-editor-iframe';
//import '@element/c4f-editor';
import '@element/ai-simulator';
import '@element/c4f-console';
import '@element/c4f-markdown';

class AiProject extends LazyElement {
    constructor(){
        super();
        this._activeFile = { id: null };
        this._editorTabGroup = new Defer();
    }

    render() {
        return html`
            <dynamic-split direction="horizontal" minSize="200px" defaultRatio="0.6" saveId="project_simulation">
                <dynamic-split slot="start" direction="vertical" minSize="50px" defaultRatio="0.8" saveId="project_console">
                    <dynamic-split slot="start" direction="horizontal" minSize="100px" defaultRatio="0.3" saveId="project_files_editor">
                        <file-tree slot="start"></file-tree>
                        <tab-group slot="end" id="editorTabGroup">
                            <!-- <c4f-editor name="Editor"></c4f-editor>-->
                            <c4f-editor-iframe name="Editor"></c4f-editor-iframe>
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
                const tabGroup = await this._editorTabGroup.promise;
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
            const tabGroup = await this._editorTabGroup.promise;
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