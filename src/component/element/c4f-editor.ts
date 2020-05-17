import { html, LitElement } from 'lit-element';
import { reaction } from 'mobx';
import { ResizeObserver } from 'resize-observer';
import * as monaco from 'monaco-editor';

import projectStore from '@store/project-store';
import settingsStore from '@store/settings-store';

import type { File, FileError, ProjectErrors } from '@store/types';

// fix for monaco language keywords, see https://github.com/microsoft/monaco-editor/issues/1423 
interface MonarchLanguageConfiguration extends monaco.languages.IMonarchLanguage {
    keywords: string[];
}

// @ts-ignore
self.MonacoEnvironment = {
    getWorkerUrl: function(_: any, label: any) {
        if (label === "json") {
            return "./monaco/json-worker.js";
          }
          if (label === "css") {
            return "./monaco/css-worker.js";
          }
          if (label === "html") {
            return "./monaco/html-worker.js";
          }
          if (label === "typescript" || label === "javascript") {
            return "./monaco/ts-worker.js";
          }
          return "./monaco/editor-worker.js";
    }
  };

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './c4f-editor.css';

type Model = {
    model: monaco.editor.ITextModel, file: File
}

class C4fEditor extends LitElement {
    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    #models: Map<number, Model> = new Map();
    #activeModel: Model | null = null;

    render() {
        const theme = settingsStore.get('editor-theme', 'vs');
        return html`
            <!--<iframe id="editor" src="iframe/monaco.html"></iframe>-->
            <div id="editor"></div>
            <select id="theme">
                <option value="vs" ?selected="${theme === 'vs'}">Light</option>
                <option value="vs-dark" ?selected="${theme === 'vs-dark'}">Dark</option>
                <option value="hc-black" ?selected="${theme === 'hc-black'}">High Contrast</option>
            </select>
        `;
    }

    async firstUpdated() {
        console.log(this.shadowRoot)
        if (!this.shadowRoot)
            return;
    
        const container = this.shadowRoot.getElementById('editor') as HTMLElement;
        const theme = this.shadowRoot.getElementById('theme') as HTMLSelectElement;

        monaco.languages.register({ id: 'prolog' });

        // Register a tokens provider for the language
        monaco.languages.setMonarchTokensProvider('prolog', {
            keywords: ['dynamic', 'is', 'call', 'catch', 'fail', 'false', 'throw', 'true', 'subsumes_term', 'unify_with_occurs_check', 'abolish', 'asserta', 'assertz', 'retract', 'retractall'],
            tokenizer: {
                root: [
                    //[/[a-z][a-zA-Z0-9]*/, 'type'],
                    [/%.*/, 'comment'],
                    { include: 'common' }
                ],
                common: [
                    [/[a-z_$][\w$]*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@default': 'type'
                        }
                    }],
                    [/[A-Z]\w*/, 'string'],
                    [/\\\+/, 'keyword'],
                    [/"[^"]*"/, 'string'],
                ]
            }
        } as MonarchLanguageConfiguration);

        const editor = monaco.editor.create(container, {
            fontSize: 14,
            scrollBeyondLastLine: false,
            scrollBeyondLastColumn: 1,
            roundedSelection: false,
            mouseWheelZoom: true,
            minimap: {
                enabled: false,
            },
            lineNumbersMinChars: 3,
            model: null,
        });

        monaco.editor.setTheme(theme.options[theme.selectedIndex].value);

        new ResizeObserver(() => {
            editor.layout();
        }).observe(container);

        editor.onDidChangeModelContent(_ => {
            if (this.#activeModel){
                projectStore.saveFileContent(this.#activeModel.file.id, editor.getValue());
            }
        });

        editor.onDidChangeCursorSelection(_ => {
            if (this.#activeModel){
                projectStore.saveFileState(this.#activeModel.file.id, editor.saveViewState());
            }
        });
        editor.onDidScrollChange(_ => {
            if (this.#activeModel){
                projectStore.saveFileState(this.#activeModel.file.id, editor.saveViewState());
            }
        })

        let lastMarkers: monaco.editor.IMarker[] | null = null;
        let projectErrors: ProjectErrors = {};
        editor.onDidChangeModelDecorations(() => {
            const markers = monaco.editor.getModelMarkers({});
            const errorMarkers = markers.filter(marker => marker.severity === 8);

            //console.log(lastMarkers, errorMarkers, !lastMarkers)
            // !lastMarkers needs testing
            if (!lastMarkers || !sameMarkers(lastMarkers, errorMarkers)) {
                lastMarkers = errorMarkers;
                //const fileErrorsList = [];
                let errorsChanged = false;
                for (const [fileId, model] of this.#models) {
                    const fileErrors = errorMarkers.filter(marker => marker.resource.path === (model.model as any)._associatedResource.path); // cast to access private member...
                    const errors: FileError[] = fileErrors.map((marker): FileError => ({
                        caller: {
                            fileId: fileId,
                            fileName: model.file.name,
                            projectId: model.file.projectId,
                            line: marker.startLineNumber,
                            column: marker.startColumn,
                            functionNames: [],
                        },
                        args: [marker.message],
                    }));
                    if (!sameErrors(projectErrors[fileId] || [], errors)) {
                        projectErrors[fileId] = errors;
                        errorsChanged = true;
                        //fileErrorsList.push({fileId, fileName: model.file.name, project: model.file.project, errors});
                    }
                }
                if (errorsChanged && projectStore.activeProject){
                    projectStore.updateProjectErrors(projectStore.activeProject.id, projectErrors);
                }
            }
        });

        theme.onchange = async (_) => {
            const selectedTheme = theme.options[theme.selectedIndex].value;
            settingsStore.set('editor-theme', selectedTheme);
            monaco.editor.setTheme(selectedTheme);
        }

        reaction(
            () => projectStore.activeFile, 
            file => {
                console.warn("change")
                if (file) {
                    const model = this.getModel(file);
                    if (this.#activeModel) {
                        projectStore.saveFileState(this.#activeModel.file.id, editor.saveViewState());
                    }
                    this.#activeModel = model;
                    editor.setModel(model.model);
                    if (file.state) {
                        editor.restoreViewState(file.state);
                    }

                    editor.focus();
                }
            }
        );

        /*const iframe = this.shadowRoot.getElementById('editor') as HTMLIFrameElement;
        const theme = this.shadowRoot.getElementById('theme') as HTMLSelectElement;

        iframe.onload = () => {
            const monaco = (iframe.contentWindow as any) as MonacoWindow;
            this.#monaco.resolve(monaco);

            new ResizeObserver(() => {
                monaco.resize();
            }).observe(iframe);

            monaco.onContentChange = (fileId, content) => {
                projectStore.saveFileContent(fileId, content);
            }

            monaco.onStateChange = (fileId, state) => {
                projectStore.saveFileState(fileId, state);
            }

            monaco.onErrorChange = (projectErrors) => {
                /*console.log(fileErrorsList)
                for(const fileErrors of fileErrorsList){
                    projectStore.saveFileErrors(fileErrors.fileId, fileErrors.errors);
                }*/
        /*if(projectStore.activeProject)
            projectStore.updateProjectErrors(projectStore.activeProject.id, projectErrors);
    }
    
    monaco.setTheme(theme.options[theme.selectedIndex].value);

    dispatchIframeEvents(iframe);
}

theme.onchange = async (_) => {
    const monaco: MonacoWindow = await this.#monaco;
    const selectedTheme = theme.options[theme.selectedIndex].value;
    settingsStore.set('editor-theme', selectedTheme);
    monaco.setTheme(selectedTheme);
}

autorun(async _ => {
    const file = projectStore.activeFile;
    console.log("file change", file)
    if (file) {
        const monaco: MonacoWindow = await this.#monaco;
        console.log("file change", monaco)
        monaco.openFile(file);
    }
});*/
    }

    getModel(file: File): Model{
        let model = this.#models.get(file.id);
    
        if(!model){
            let language = 'plain_text';
            const ending = file.name.match(/\.([a-z]+)$/);
            if (ending) {
                switch (ending[1]) {
                    case 'js': language = 'javascript'; break;
                    case 'json': language = 'json'; break;
                    case 'pl': language = 'prolog'; break;
                    case 'md': language = 'markdown'; break;
                }
            }
            model = {
                model: monaco.editor.createModel(file.content || '', language),
                file: file
            };
            this.#models.set(file.id, model);
        }
    
        return model;
    }
}

window.customElements.define('c4f-editor', C4fEditor);



function sameMarker(a: monaco.editor.IMarker, b: monaco.editor.IMarker){
    return (
        a.code === b.code &&
        a.startColumn === b.startColumn &&
        a.startLineNumber === b.startLineNumber &&
        a.message === b.message &&
        a.resource.path === b.resource.path
    );
}

function sameMarkers(a: monaco.editor.IMarker[], b: monaco.editor.IMarker[]){
    if(!a || !b || a.length !== b.length)
        return false;
    for(let i = 0; i < a.length; i++){
        if(!sameMarker(a[i], b[i]))
            return false;
    }
    return true;
}

function sameError(a: FileError, b: FileError){
    return (
        a.caller.fileId === b.caller.fileId &&
        a.caller.line === b.caller.line &&
        a.caller.column === b.caller.column
    );
}

function sameErrors(a: FileError[], b: FileError[]){
    if(!a || !b || a.length !== b.length)
        return false;
    for(let i = 0; i < a.length; i++){
        if(!sameError(a[i], b[i]))
            return false;
    }
    return true;
}