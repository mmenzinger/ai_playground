import React, { useState, useEffect } from 'react';
import { autorun } from 'mobx';
import store, { File } from '@store';
import { Tabs, Tab } from 'react-bootstrap';

import Editor from './editor';
import Markdown from './markdown';

import css from './file-viewer.module.css';

export function FileViewer() {
    const [tab, setTab] = useState<string>();
    const [type, setType] = useState<string>();
    const [toggle, setToggle] = useState<string>();
    const [file, setFile] = useState<File>();

    let closed = false;
    useEffect(() => {
        autorun(() => {
            const _file = store.project.activeFile;
            const _type = _file?.name.split('.').pop();
            setType(_type);
            setFile(_file || undefined);
            if (_type === 'md') {
                setTab('markdown');
            } else if (_type?.match(/(png|jpe?g)/)) {
                setTab('image');
            } else {
                setTab('editor');
            }
        });
        return () => {
            closed = true;
        };
    }, []);

    useEffect(() => {
        if (tab === 'markdown') {
            setToggle('editor');
        } else if (tab === 'editor' && type === 'md') {
            setToggle('markdown');
        } else {
            setToggle(undefined);
        }
    }, [tab, type]);

    return (
        <div className={css.root}>
            <Tabs
                className={[css.tabs, toggle]}
                activeKey={tab}
                onSelect={(tab) => setTab(tab || undefined)}
                variant="pills"
            >
                <Tab eventKey="editor" title="Editor">
                    <Editor />
                </Tab>
                <Tab eventKey="markdown" title="Markdown">
                    <Markdown />
                </Tab>
                <Tab eventKey="image" title="Image">
                    <img
                        className={css.image}
                        src={`/${store.project.activeProject?.id || 'assets'}/${
                            file?.name || 'logo.png'
                        }`}
                    />
                </Tab>
            </Tabs>
        </div>
    );
}
export default FileViewer;

// // import * as monaco from 'monaco-editor';
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

// // (1) Desired editor features:
// import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
// // import 'monaco-editor/esm/vs/editor/browser/widget/codeEditorWidget.js';
// // import 'monaco-editor/esm/vs/editor/browser/widget/diffEditorWidget.js';
// // import 'monaco-editor/esm/vs/editor/browser/widget/diffNavigator.js';
// import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/bracketMatching.js';
// // import 'monaco-editor/esm/vs/editor/contrib/caretOperations/caretOperations.js';
// // import 'monaco-editor/esm/vs/editor/contrib/caretOperations/transpose.js';
// // import 'monaco-editor/esm/vs/editor/contrib/clipboard/clipboard.js';
// // import 'monaco-editor/esm/vs/editor/contrib/codelens/codelensController.js';
// // import 'monaco-editor/esm/vs/editor/contrib/colorPicker/colorDetector.js';
// import 'monaco-editor/esm/vs/editor/contrib/comment/comment.js';
// // import 'monaco-editor/esm/vs/editor/contrib/contextmenu/contextmenu.js';
// // import 'monaco-editor/esm/vs/editor/contrib/cursorUndo/cursorUndo.js';
// // import 'monaco-editor/esm/vs/editor/contrib/dnd/dnd.js';
// import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
// import 'monaco-editor/esm/vs/editor/contrib/folding/folding.js';
// import 'monaco-editor/esm/vs/editor/contrib/format/formatActions.js';
// // import 'monaco-editor/esm/vs/editor/contrib/goToDeclaration/goToDeclarationCommands.js';
// // import 'monaco-editor/esm/vs/editor/contrib/goToDeclaration/goToDeclarationMouse.js';
// // import 'monaco-editor/esm/vs/editor/contrib/gotoError/gotoError.js';
// import 'monaco-editor/esm/vs/editor/contrib/hover/hover.js';
// // import 'monaco-editor/esm/vs/editor/contrib/inPlaceReplace/inPlaceReplace.js';
// import 'monaco-editor/esm/vs/editor/contrib/linesOperations/linesOperations.js';
// // import 'monaco-editor/esm/vs/editor/contrib/links/links.js';
// import 'monaco-editor/esm/vs/editor/contrib/multicursor/multicursor.js';
// import 'monaco-editor/esm/vs/editor/contrib/parameterHints/parameterHints.js';
// // import 'monaco-editor/esm/vs/editor/contrib/quickFix/quickFixCommands.js';
// // import 'monaco-editor/esm/vs/editor/contrib/referenceSearch/referenceSearch.js';
// import 'monaco-editor/esm/vs/editor/contrib/rename/rename.js';
// import 'monaco-editor/esm/vs/editor/contrib/smartSelect/smartSelect.js';
// // import 'monaco-editor/esm/vs/editor/contrib/snippet/snippetController2.js';
// import 'monaco-editor/esm/vs/editor/contrib/suggest/suggestController.js';
// // import 'monaco-editor/esm/vs/editor/contrib/toggleTabFocusMode/toggleTabFocusMode.js';
// import 'monaco-editor/esm/vs/editor/contrib/wordHighlighter/wordHighlighter.js';
// import 'monaco-editor/esm/vs/editor/contrib/wordOperations/wordOperations.js';
// // import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';
// // import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
// // import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickOpen/quickOutline.js';
// // import 'monaco-editor/esm/vs/editor/standalone/browser/quickOpen/gotoLine.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickOpen/quickCommand.js';
// // import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js';

// // (2) Desired languages:
// import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
// // import 'monaco-editor/esm/vs/language/css/monaco.contribution';
// import 'monaco-editor/esm/vs/language/json/monaco.contribution';
// // import 'monaco-editor/esm/vs/language/html/monaco.contribution';
// // import 'monaco-editor/esm/vs/basic-languages/bat/bat.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/coffee/coffee.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/csharp/csharp.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/csp/csp.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/css/css.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/fsharp/fsharp.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/go/go.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/handlebars/handlebars.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/html/html.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/ini/ini.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/java/java.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/less/less.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/lua/lua.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/msdax/msdax.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/mysql/mysql.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/objective-c/objective-c.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/php/php.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/postiats/postiats.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/powershell/powershell.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/pug/pug.contribution.js';
// //import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/r/r.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/razor/razor.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/redis/redis.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/redshift/redshift.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/ruby/ruby.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/sb/sb.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/scss/scss.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/solidity/solidity.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/swift/swift.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/vb/vb.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution.js';
// // import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
// // import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution';

// import type { File, ProjectErrors, FileError, Project } from '@store/types';
// import { html, LitElement } from 'lit-element';
// import { reaction } from 'mobx';
// import projectStore from '@store/project-store';
// import settingsStore from '@store/settings-store';
// import { ResizeObserver } from 'resize-observer';
// import { isString } from 'lodash-es';

// import db from '@localdb';

// // @ts-ignore
// import sharedStyles from '@shared-styles';
// // @ts-ignore
// import style from './c4f-editor.css';

// // @ts-ignore
// import tUtil from '!!raw-loader!@lib/utils.d.ts';
// // @ts-ignore
// import tProlog from '!!raw-loader!@lib/prolog.d.ts';
// // @ts-ignore
// import tTensorflow from '!!raw-loader!@lib/tensorflow.d.ts';

// // fix for monaco language keywords, see https://github.com/microsoft/monaco-editor/issues/1423
// interface MonarchLanguageConfiguration extends monaco.languages.IMonarchLanguage {
//     keywords: string[];
// }

// // @ts-ignore
// self.MonacoEnvironment = {
//     getWorkerUrl: function (_: any, label: any) {
//         if (label === "json") {
//             return "./monaco/json-worker.js";
//         }
//         // if (label === "css") {
//         //     return "./monaco/css-worker.js";
//         // }
//         // if (label === "html") {
//         //     return "./monaco/html-worker.js";
//         // }
//         if (label === "typescript" || label === "javascript") {
//             return "./monaco/ts-worker.js";
//         }
//         return "./monaco/editor-worker.js";
//     }
// };

// //declare var monaco: any;
// // @ts-ignore
// //require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});
// // @ts-ignore
// //require(['vs/editor/editor.main'], function() {

// monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
//     noSemanticValidation: false,
//     noSyntaxValidation: false,
//     noSuggestionDiagnostics: false,
//     diagnosticCodesToIgnore: [],
// });

// monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
//     target: monaco.languages.typescript.ScriptTarget.ESNext,
//     allowNonTsExtensions: true,
//     allowJs: true,
//     alwaysStrict: true,
//     checkJs: true,
//     esModuleInterop: true,
//     module: monaco.languages.typescript.ModuleKind.ESNext,
//     paths: {
//         "@/*": ["./"]
//     },
//     baseUrl: './',
// });

// monaco.languages.typescript.javascriptDefaults.setExtraLibs([
//     { filePath: 'lib/utils.js', content: tUtil },
//     { filePath: 'lib/prolog.js', content: tProlog },
//     { filePath: 'lib/tensorflow.js', content: tTensorflow },
// ]);

// monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

// monaco.languages.register({ id: 'prolog' });

// // Register a tokens provider for the language
// monaco.languages.setMonarchTokensProvider('prolog', {
//     keywords: ['dynamic', 'is', 'call', 'catch', 'fail', 'false', 'throw', 'true', 'subsumes_term', 'unify_with_occurs_check', 'abolish', 'asserta', 'assertz', 'retract', 'retractall'],
//     tokenizer: {
//         root: [
//             //[/[a-z][a-zA-Z0-9]*/, 'type'],
//             [/%.*/, 'comment'],
//             { include: 'common' }
//         ],
//         common: [
//             [/[a-z_$][\w$]*/, {
//                 cases: {
//                     '@keywords': 'keyword',
//                     '@default': 'type'
//                 }
//             }],
//             [/[A-Z]\w*/, 'string'],
//             [/\\\+/, 'keyword'],
//             [/"[^"]*"/, 'string'],
//         ]
//     }
// } as MonarchLanguageConfiguration);

// class C4fEditor extends LitElement {
//     static get styles() {
//         return [
//             sharedStyles,
//             style,
//         ];
//     }
//     #firstErrorUpdate = true;

//     #modelFiles: Map<string, File> = new Map(); // model.id => File
//     #activeFile: File | null = null;
//     #activeProject: Project | null = null;
//     #lastMarkers: monaco.editor.IMarker[] | null = null;
//     #projectErrors: ProjectErrors = {};
//     #editor: monaco.editor.IStandaloneCodeEditor;

//     render() {
//         this.#firstErrorUpdate = true;
//         const theme = settingsStore.get('editor-theme', 'vs');
//         const wrap = settingsStore.get('editor-wordwrap', false);
//         return html`
//             <div id="editor"></div>
//             <ul id="menu">
//                 <li>
//                     <input type="checkbox" id="wordwrap" ?checked=${wrap}>
//                     <label for="wordwrap">word wrap</label>
//                 </li>
//                 <li>
//                     <select id="theme">
//                         <option value="vs" ?selected="${theme === 'vs'}">Light</option>
//                         <option value="vs-dark" ?selected="${theme === 'vs-dark'}">Dark</option>
//                         <option value="hc-black" ?selected="${theme === 'hc-black'}">High Contrast</option>
//                     </select>
//                 </li>
//             </ul>
//             <div id="preview" style="display:none"></div>
//         `;
//     }

//     async firstUpdated() {
//         const editor = this.shadowRoot?.getElementById('editor') as HTMLDivElement;
//         const theme = this.shadowRoot?.getElementById('theme') as HTMLSelectElement;
//         const wordwrap = this.shadowRoot?.getElementById('wordwrap') as HTMLInputElement;

//         this.#editor = monaco.editor.create(editor, {
//             fontSize: 14,
//             scrollBeyondLastLine: false,
//             scrollBeyondLastColumn: 1,
//             roundedSelection: false,
//             mouseWheelZoom: true,
//             minimap: {
//                 enabled: false,
//             },
//             lineNumbersMinChars: 3,
//             wordWrap: 'on',
//             model: null,
//         });

//         this.#editor.onDidChangeModelContent(_ => {
//             if (this.#activeFile?.id){
//                 projectStore.saveFileContent(this.#activeFile.id, this.#editor.getValue());
//             }
//         });

//         this.#editor.onDidChangeCursorSelection(_ => {
//             if (this.#activeFile?.id){
//                 projectStore.saveFileState(this.#activeFile.id, this.#editor.saveViewState());
//             }
//         });
//         this.#editor.onDidScrollChange(_ => {
//             if (this.#activeFile?.id){
//                 projectStore.saveFileState(this.#activeFile.id, this.#editor.saveViewState());
//             }
//         })

//         this.#editor.onDidChangeModelDecorations(_ => {
//             this.markersUpdated();
//         });

//         new ResizeObserver(() => {
//             try{
//                 this.#editor.layout();
//             }
//             catch(_){
//                 //console.warn(error);
//             }
//         }).observe(editor);

//         monaco.editor.setTheme(theme.options[theme.selectedIndex].value);
//         this.#editor.updateOptions({ wordWrap: wordwrap.checked ? 'on' : 'off' });
//         this.#editor.focus();

//         theme.onchange = async (_) => {
//             const selectedTheme = theme.options[theme.selectedIndex].value;
//             settingsStore.set('editor-theme', selectedTheme);
//             monaco.editor.setTheme(selectedTheme);
//         }

//         wordwrap.onchange = async (_) => {
//             settingsStore.set('editor-wordwrap', wordwrap.checked);
//             this.#editor.updateOptions({ wordWrap: wordwrap.checked ? 'on' : 'off' });
//         }

//         let project: Project;
//         let file: File;
//         reaction(
//             () => ({
//                 activeProject: projectStore.activeProject,
//                 activeFile: projectStore.activeFile,
//             }),
//             async (data, _) => {
//                 if(data.activeProject !== project && data.activeProject){
//                     project = data.activeProject;
//                     let files = await db.getProjectFiles(project.id);
//                     files = [...files, ...await db.getProjectFiles(0)].filter(file => !(file.content instanceof Blob));
//                     this.openProject(project, files);
//                 }
//                 if (data.activeFile !== file && data.activeFile) {
//                     file = data.activeFile;
//                     const editor = this.shadowRoot?.getElementById('editor') as HTMLElement;
//                     const menu = this.shadowRoot?.getElementById('menu') as HTMLElement;
//                     const preview = this.shadowRoot?.getElementById('preview') as HTMLElement;
//                     if(/\.(png|jpe?g)$/.test(file.name)){
//                         editor.style.display = 'none';
//                         menu.style.display = 'none';
//                         preview.style.display = 'block';
//                         preview.innerHTML = `<img src="/${file.projectId}/${file.name}">`;
//                     }
//                     else{
//                         editor.style.display = 'block';
//                         menu.style.display = 'flex';
//                         preview.style.display = 'none';
//                         this.openFile(file);
//                     }
//                 }
//             },
//             {
//                 fireImmediately: true,
//             }
//         );
//     }

//     markersUpdated() {
//         const markers: monaco.editor.IMarker[] = monaco.editor.getModelMarkers({});
//         const errorMarkers = markers.filter(marker => marker.severity === 8);
//         //console.log(lastMarkers, errorMarkers, !lastMarkers)
//         if (!this.#lastMarkers || !sameMarkers(this.#lastMarkers, errorMarkers)) {
//             let errorsChanged = false;
//             this.#lastMarkers = errorMarkers;
//             const models = monaco.editor.getModels();
//             for (const model of models) {
//                 const fileErrors = errorMarkers.filter(marker => marker.resource.path === (model as any)._associatedResource.path);
//                 const file = this.#modelFiles.get(model.id);
//                 if(file){
//                     const errors: FileError[] = fileErrors.map((marker): FileError => ({
//                         caller: {
//                             fileId: file.id,
//                             fileName: file.name,
//                             projectId: file.projectId,
//                             line: marker.startLineNumber,
//                             column: marker.startColumn,
//                             functionNames: [],
//                         },
//                         args: [marker.message],
//                     }));
//                     if (!sameErrors(this.#projectErrors[file.id] || [], errors)) {
//                         this.#projectErrors[file.id] = errors;
//                         errorsChanged = true;
//                     }
//                 }
//                 else{
//                     console.warn('marker without loaded file');
//                 }
//             }
//             //console.log(errorsChanged, projectErrors);
//             if (errorsChanged) {
//                 if(this.#firstErrorUpdate){
//                     this.#firstErrorUpdate = false;
//                     if(projectStore.activeFile){
//                         this.openFile(projectStore.activeFile);
//                     }
//                 }
//                 if(projectStore.activeProject){
//                     projectStore.updateProjectErrors(projectStore.activeProject.id, this.#projectErrors);
//                 }
//             }
//         }
//     }

//     createModel(file: File, uri: monaco.Uri) {
//         let language = 'javascript';
//         const ending = file.name.match(/\.([a-z]+)$/);
//         if (ending) {
//             switch (ending[1]) {
//                 case 'js': language = 'javascript'; break;
//                 case 'json': language = 'json'; break;
//                 case 'pl': language = 'prolog'; break;
//                 case 'md': language = 'markdown'; break;
//             }
//         }
//         if(file.content instanceof Blob)
//             return null;
//         return monaco.editor.createModel(
//             file.content || '',
//             language,
//             uri
//         );
//     }

//     openProject(project: Project, files: File[], initialFile?: File) {
//         this.#projectErrors = {};
//         // preload files
//         const modelsValidated = [];
//         for (const file of files) {
//             const path = (file.projectId ? '/project/' : '/global/') + file.name;
//             const uri = monaco.Uri.parse(path)
//             let model = monaco.editor.getModel(uri);
//             if (!model) {
//                 model = this.createModel(file, uri);
//             }
//             else {
//                 if(! (file.content instanceof Blob)){
//                     model.setValue(file.content || '');
//                 }
//             }
//             if(model){
//                 modelsValidated.push(validateModel(model));
//                 this.#modelFiles.set(model.id, file);
//             }
//         }
//         Promise.all(modelsValidated).then(_ => {
//             this.markersUpdated();
//         });

//         this.#activeProject = project;
//         if (initialFile) {
//             this.openFile(initialFile);
//         }
//     }

//     openFile(file: File) {
//         if(file.content instanceof Blob)
//             return;

//         if(!file){
//             console.warn('tried to open non existing file');
//             return;
//         }

//         if (this.#activeFile) {
//             this.#activeFile.state = this.#editor.saveViewState() || undefined;
//         }
//         this.#activeFile = file;

//         let path;
//         if (file.id) {
//             path = (file.projectId ? '/project/' : '/global/') + file.name;
//         }
//         else {
//             path = file.name;
//         }
//         const uri = monaco.Uri.parse(path)
//         let model = monaco.editor.getModel(uri);
//         if (!model) {
//             model = this.createModel(file, uri);
//         }
//         if(!model){
//             console.error(file);
//             throw Error(`could not open file!`);
//         }
//         model.setValue(file.content || '');
//         this.#editor.setModel(model);

//         if (file.state) {
//             this.#editor.restoreViewState(file.state);
//         }

//         if (file.id) {
//             this.#editor.updateOptions({ readOnly: false });
//         }
//         else {
//             this.#editor.updateOptions({ readOnly: true });
//         }

//         this.#editor.focus();
//     }
// }

// window.customElements.define('c4f-editor', C4fEditor);

// async function validateModel(model: monaco.editor.ITextModel, getWorker?: (...uris: monaco.Uri[]) => Promise<monaco.languages.typescript.TypeScriptWorker>) {
//     const owner = model.getModeId();
//     if (!model.isDisposed() && owner === 'javascript') {
//         if (getWorker === undefined) {
//             getWorker = await monaco.languages.typescript.getJavaScriptWorker();
//         }
//         const worker = await getWorker(model.uri);
//         const diagnostics = (await Promise.all([
//             worker.getSyntacticDiagnostics(model.uri.toString()),
//             worker.getSemanticDiagnostics(model.uri.toString())
//         ])).reduce((a, it) => a.concat(it));

//         const markers = diagnostics.map(d => {
//             const start = model.getPositionAt(d.start || 0);
//             const end = model.getPositionAt((d.start || 0) + (d.length || 0));
//             return {
//                 severity: monaco.MarkerSeverity.Error,
//                 startLineNumber: start.lineNumber,
//                 startColumn: start.column,
//                 endLineNumber: end.lineNumber,
//                 endColumn: end.column,
//                 message: flattenMessageChain(d.messageText),
//             };
//         });

//         monaco.editor.setModelMarkers(model, owner, markers);
//     }
// }

// function flattenMessageChain(chain: string | monaco.languages.typescript.DiagnosticMessageChain): string {
//     if (isString(chain))
//         return chain;
//     else {
//         return chain.messageText;
//     }
// }

// function sameMarker(a: monaco.editor.IMarker, b: monaco.editor.IMarker) {
//     return (
//         a.code === b.code &&
//         a.startColumn === b.startColumn &&
//         a.startLineNumber === b.startLineNumber &&
//         a.message === b.message &&
//         a.resource.path === b.resource.path
//     );
// }

// function sameMarkers(a: monaco.editor.IMarker[], b: monaco.editor.IMarker[]) {
//     if (!a || !b || a.length !== b.length)
//         return false;
//     for (let i = 0; i < a.length; i++) {
//         if (!sameMarker(a[i], b[i]))
//             return false;
//     }
//     return true;
// }

// function sameError(a: FileError, b: FileError) {
//     return (
//         a.caller.fileId === b.caller.fileId &&
//         a.caller.line === b.caller.line &&
//         a.caller.column === b.caller.column
//     );
// }

// function sameErrors(a: FileError[], b: FileError[]) {
//     if (!a || !b || a.length !== b.length)
//         return false;
//     for (let i = 0; i < a.length; i++) {
//         if (!sameError(a[i], b[i]))
//             return false;
//     }
//     return true;
// }
