import type { File, FileError, ProjectErrors } from '@store/types';
//import * as monaco from 'monaco-editor';

// (1) Desired editor features:
import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
// import 'monaco-editor/esm/vs/editor/browser/widget/codeEditorWidget.js';
// import 'monaco-editor/esm/vs/editor/browser/widget/diffEditorWidget.js';
// import 'monaco-editor/esm/vs/editor/browser/widget/diffNavigator.js';
import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/bracketMatching.js';
// import 'monaco-editor/esm/vs/editor/contrib/caretOperations/caretOperations.js';
// import 'monaco-editor/esm/vs/editor/contrib/caretOperations/transpose.js';
// import 'monaco-editor/esm/vs/editor/contrib/clipboard/clipboard.js';
// import 'monaco-editor/esm/vs/editor/contrib/codelens/codelensController.js';
// import 'monaco-editor/esm/vs/editor/contrib/colorPicker/colorDetector.js';
// import 'monaco-editor/esm/vs/editor/contrib/comment/comment.js';
// import 'monaco-editor/esm/vs/editor/contrib/contextmenu/contextmenu.js';
// import 'monaco-editor/esm/vs/editor/contrib/cursorUndo/cursorUndo.js';
// import 'monaco-editor/esm/vs/editor/contrib/dnd/dnd.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import 'monaco-editor/esm/vs/editor/contrib/folding/folding.js';
// import 'monaco-editor/esm/vs/editor/contrib/format/formatActions.js';
// import 'monaco-editor/esm/vs/editor/contrib/goToDeclaration/goToDeclarationCommands.js';
// import 'monaco-editor/esm/vs/editor/contrib/goToDeclaration/goToDeclarationMouse.js';
// import 'monaco-editor/esm/vs/editor/contrib/gotoError/gotoError.js';
import 'monaco-editor/esm/vs/editor/contrib/hover/hover.js';
// import 'monaco-editor/esm/vs/editor/contrib/inPlaceReplace/inPlaceReplace.js';
// import 'monaco-editor/esm/vs/editor/contrib/linesOperations/linesOperations.js';
// import 'monaco-editor/esm/vs/editor/contrib/links/links.js';
import 'monaco-editor/esm/vs/editor/contrib/multicursor/multicursor.js';
import 'monaco-editor/esm/vs/editor/contrib/parameterHints/parameterHints.js';
// import 'monaco-editor/esm/vs/editor/contrib/quickFix/quickFixCommands.js';
// import 'monaco-editor/esm/vs/editor/contrib/referenceSearch/referenceSearch.js';
import 'monaco-editor/esm/vs/editor/contrib/rename/rename.js';
import 'monaco-editor/esm/vs/editor/contrib/smartSelect/smartSelect.js';
// import 'monaco-editor/esm/vs/editor/contrib/snippet/snippetController2.js';
// import 'monaco-editor/esm/vs/editor/contrib/suggest/suggestController.js';
// import 'monaco-editor/esm/vs/editor/contrib/toggleTabFocusMode/toggleTabFocusMode.js';
// import 'monaco-editor/esm/vs/editor/contrib/wordHighlighter/wordHighlighter.js';
// import 'monaco-editor/esm/vs/editor/contrib/wordOperations/wordOperations.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickOpen/quickOutline.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickOpen/gotoLine.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickOpen/quickCommand.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

// (2) Desired languages:
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
// import 'monaco-editor/esm/vs/language/css/monaco.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
// import 'monaco-editor/esm/vs/language/html/monaco.contribution';
// import 'monaco-editor/esm/vs/basic-languages/bat/bat.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/coffee/coffee.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/csharp/csharp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/csp/csp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/css/css.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/fsharp/fsharp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/go/go.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/handlebars/handlebars.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/html/html.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/ini/ini.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/java/java.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/less/less.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/lua/lua.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/msdax/msdax.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/mysql/mysql.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/objective-c/objective-c.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/php/php.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/postiats/postiats.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/powershell/powershell.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/pug/pug.contribution.js';
//import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/r/r.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/razor/razor.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/redis/redis.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/redshift/redshift.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/ruby/ruby.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/sb/sb.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/scss/scss.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/solidity/solidity.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/swift/swift.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/vb/vb.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
// import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution';

// @ts-ignore
import tUtil from '!!raw-loader!@scenario/util.d.ts';
// @ts-ignore
import tTicTacToe from '!!raw-loader!@scenario/tictactoe/scenario.d.ts';

type Model = {
    model: monaco.editor.ITextModel, file: File
}

// fix for monaco language keywords, see https://github.com/microsoft/monaco-editor/issues/1423 
interface MonarchLanguageConfiguration extends monaco.languages.IMonarchLanguage {
    keywords: string[];
}

// @ts-ignore
self.MonacoEnvironment = {
    getWorkerUrl: function (_: any, label: any) {
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

const models: Map<number, Model> = new Map();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
let activeFile: File | null = null;

declare var window: MonacoWindow;
//declare var monaco: any;
// @ts-ignore
//require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});
// @ts-ignore
//require(['vs/editor/editor.main'], function() {



monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
    diagnosticCodesToIgnore: [],
});

monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    allowJs: true,
    alwaysStrict: true,
    checkJs: true,
    esModuleInterop: true,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    baseUrl: 'file:///',
});

monaco.languages.typescript.javascriptDefaults.setExtraLibs([
    { filePath: 'http:/scenario/util.js', content: tUtil },
    { filePath: 'http:/scenario/tictactoe/scenario.js', content: tTicTacToe },
]);

monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

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

const container = document.getElementById('container') as HTMLElement;
editor = monaco.editor.create(container, {
    fontSize: 14,
    scrollBeyondLastLine: false,
    scrollBeyondLastColumn: 1,
    roundedSelection: false,
    mouseWheelZoom: true,
    minimap: {
        enabled: false,
    },
    lineNumbersMinChars: 3,
    wordWrap: 'on',
    model: null,
}) as monaco.editor.IStandaloneCodeEditor;

editor.onDidChangeModelContent(_ => {
    if (activeFile && editor)
        window.onContentChange(activeFile.id, editor.getValue());
});

editor.onDidChangeCursorSelection(_ => {
    if (activeFile && editor)
        window.onStateChange(activeFile.id, editor.saveViewState());
});
editor.onDidScrollChange(_ => {
    if (activeFile && editor)
        window.onStateChange(activeFile.id, editor.saveViewState());
})

let lastMarkers: monaco.editor.IMarker[] | null = null;
let projectErrors: ProjectErrors = {};
editor.onDidChangeModelDecorations(() => {
    const markers: monaco.editor.IMarker[] = monaco.editor.getModelMarkers({});
    const errorMarkers = markers.filter(marker => marker.severity === 8);

    //console.log(lastMarkers, errorMarkers, !lastMarkers)
    // !lastMarkers needs testing
    if (!lastMarkers || !sameMarkers(lastMarkers, errorMarkers)) {
        lastMarkers = errorMarkers;
        //const fileErrorsList = [];
        let errorsChanged = false;
        for (const [fileId, model] of models) {
            const fileErrors = errorMarkers.filter(marker => marker.resource.path === (model.model as any)._associatedResource.path);
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
        if (errorsChanged)
            window.onErrorChange(projectErrors);
    }
});

window.setErrors = (errors: ProjectErrors) => {
    projectErrors = errors;
}

window.preloadFile = (file: File) => {
    let model = null
    if(editor){
        const path = (file.projectId ? '/project/' : '/global/') + file.name;
        const uri = monaco.Uri.parse(`http://${path}`)
    
        model = monaco.editor.getModel(uri);
        if(!model){
            let language = 'javascript';
            const ending = file.name.match(/\.([a-z]+)$/);
            if (ending) {
                switch (ending[1]) {
                    case 'js': language = 'javascript'; break;
                    case 'json': language = 'json'; break;
                    case 'pl': language = 'prolog'; break;
                    case 'md': language = 'markdown'; break;
                }
            }
            model = monaco.editor.createModel(
                file.content || '',
                language,
                uri
            );
        }
        models.set(file.id, {model, file});
    }
    return model;
}

window.openFile = (file: File) => {
    if (editor) {
        if (activeFile) {
            activeFile.state = editor.saveViewState() || undefined;
        }

        let model = window.preloadFile(file);
        editor.setModel(model);
        if (file.state) {
            editor.restoreViewState(file.state);
        }
        activeFile = file;

        editor.focus();
    }
}

window.resize = () => {
    if (editor)
        editor.layout();
}

window.setTheme = (theme: string) => {
    monaco.editor.setTheme(theme);
}

window.focus = () => {
    if (editor)
        editor.focus();
}

window.onContentChange = (_: number, _1: string) => { };
window.onStateChange = (_: number, _1: Object) => { };
window.onErrorChange = (_: ProjectErrors) => { };
//});


function sameMarker(a: monaco.editor.IMarker, b: monaco.editor.IMarker) {
    return (
        a.code === b.code &&
        a.startColumn === b.startColumn &&
        a.startLineNumber === b.startLineNumber &&
        a.message === b.message &&
        a.resource.path === b.resource.path
    );
}

function sameMarkers(a: monaco.editor.IMarker[], b: monaco.editor.IMarker[]) {
    if (!a || !b || a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (!sameMarker(a[i], b[i]))
            return false;
    }
    return true;
}

function sameError(a: FileError, b: FileError) {
    return (
        a.caller.fileId === b.caller.fileId &&
        a.caller.line === b.caller.line &&
        a.caller.column === b.caller.column
    );
}

function sameErrors(a: FileError[], b: FileError[]) {
    if (!a || !b || a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (!sameError(a[i], b[i]))
            return false;
    }
    return true;
}

export type MonacoWindow = Window & {
    onContentChange: (fileId: number, content: string) => void,
    onStateChange: (fileId: number, state: any) => void,
    onErrorChange: (errors: ProjectErrors) => void,
    setErrors: (errors: ProjectErrors) => void,
    preloadFile:(file: File) => monaco.editor.ITextModel | null,
    openFile: (file: File) => void,
    setExtraLibs: (libs: { content: string, filePath?: string }[]) => void,
    resize: () => void,
    setTheme: (theme: string) => void,
    focus: () => void,
};