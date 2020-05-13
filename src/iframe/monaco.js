// @flow
import type { File, FileError, ProjectErrors } from '@types';

type Model = {
    _associatedResource: any,
    file: File,
}

const models: Map<number, Model> = new Map();
let editor: ?Object = null;
let activeModel: ?Model = null;

declare var window: MonacoWindow;
declare var monaco: any;
//$FlowFixMe - suppress require errors
require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});
//$FlowFixMe - suppress require errors
require(['vs/editor/editor.main'], function() {
    
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
    });

    const container = document.getElementById('container');
    editor = monaco.editor.create(container, {
        fontSize: '14px',
        scrollBeyondLastLine: false,
        scrollBeyondLastColumn: false,
        roundedSelection: false,
        mouseWheelZoom: true,
        minimap: {
            enabled: false,
        },
        lineNumbersMinChars: 3,
        model: null,
    });

    editor.onDidChangeModelContent(_ => {
        if(activeModel && editor)
            window.onContentChange(activeModel.file.id, editor.getValue());
    });

    editor.onDidChangeCursorSelection(_ => {
        if(activeModel && editor)
            window.onStateChange(activeModel.file.id, editor.saveViewState());
    });
    editor.onDidScrollChange(_ => {
        if(activeModel && editor)
            window.onStateChange(activeModel.file.id, editor.saveViewState());
    })

    let lastMarkers = null;
    let projectErrors: ProjectErrors = {};
    editor.onDidChangeModelDecorations(() => {
        const markers = monaco.editor.getModelMarkers();
        const errorMarkers = markers.filter(marker => marker.severity === 8);

        //console.log(lastMarkers, errorMarkers, !lastMarkers)
        // !lastMarkers needs testing
        if(!lastMarkers || !sameMarkers(lastMarkers, errorMarkers)){
            lastMarkers = errorMarkers;
            //const fileErrorsList = [];
            let errorsChanged = false;
            for(const [fileId, model] of models){
                const fileErrors = errorMarkers.filter(marker => marker.resource.path === model._associatedResource.path);
                const errors: FileError[] = fileErrors.map((marker): FileError => ({
                    caller: {
                        fileId: fileId,
                        fileName: model.file.name,
                        projectId: model.file.projectId,
                        line: marker.startLineNumber,
                        column: marker.startColumn,
                    },
                    args: [marker.message],
                }));
                if(!sameErrors(projectErrors[fileId], errors)){
                    projectErrors[fileId] = errors;
                    errorsChanged = true;
                    //fileErrorsList.push({fileId, fileName: model.file.name, project: model.file.project, errors});
                }
            }
            if(errorsChanged)
                window.onErrorChange(projectErrors);
        }
    });

    window.setErrors = (errors: ProjectErrors) => {
        projectErrors = errors;
    }

    window.openFile = (file: File) => {
        if(editor){
            const model = getModel(file);
            if(activeModel){
                activeModel.file.state = editor.saveViewState();
            }
            activeModel = model;
            editor.setModel(model);
            if(file.state){
                editor.restoreViewState(file.state);
            }
    
            editor.focus();
        }
    }

    window.resize = () => {
        if(editor)
            editor.layout();
    }

    window.setTheme = (theme: string) => {
        monaco.editor.setTheme(theme);
    }

    window.focus = () => {
        if(editor)
            editor.focus();
    }

    window.onContentChange = (fileId: number, content: string) => {};
    window.onStateChange = (fileId:number, state: Object) => {};
    window.onErrorChange = (errors: ProjectErrors) => {};
});

function getModel(file: File){
    let model = models.get(file.id);

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
        model = monaco.editor.createModel(file.content, language);
        model.file = file;
        models.set(file.id, model);
    }

    return model;
}

function sameMarker(a: Object, b: Object){
    return (
        a.code === b.code &&
        a.startColumn === b.startColumn &&
        a.startLineNumber === b.startLineNumber &&
        a.message === b.message &&
        a.resource.path === b.resource.path
    );
}

function sameMarkers(a: Object[], b: Object[]){
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

function sameErrors(a, b){
    if(!a || !b || a.length !== b.length)
        return false;
    for(let i = 0; i < a.length; i++){
        if(!sameError(a[i], b[i]))
            return false;
    }
    return true;
}

export type MonacoWindow = {
    onContentChange: (fileId: number, content: string) => void,
    onStateChange: (fileId: number, state: Object) => void,
    onErrorChange: (errors: ProjectErrors) => void,
    setErrors: (errors: ProjectErrors) => void,
    openFile: (file: File) => void,
    resize: () => void,
    setTheme: (theme: string) => void,
    focus: () => void,
};