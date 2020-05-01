const models = new Map();
let editor = null;
let activeModel = null;
let contentChangeCallback = () => {};
let errorMarkerCallback = () => {};

require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});
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
        window.onContentChange(activeModel.file.id, editor.getValue());
    });

    editor.onDidChangeCursorSelection(_ => {
        window.onStateChange(activeModel.file.id, editor.saveViewState());
    });
    editor.onDidScrollChange(_ => {
        window.onStateChange(activeModel.file.id, editor.saveViewState());
    })

    let lastMarkers = null;
    let projectErrors = {};
    editor.onDidChangeModelDecorations(() => {
        const markers = monaco.editor.getModelMarkers();
        const errorMarkers = markers.filter(marker => marker.severity === 8);

        console.log(lastMarkers, errorMarkers, !lastMarkers)
        // !lastMarkers needs testing
        if(!lastMarkers || !sameMarkers(lastMarkers, errorMarkers)){
            lastMarkers = errorMarkers;
            const fileErrorsList = [];
            for(const [fileId, model] of models){
                const fileErrors = errorMarkers.filter(marker => marker.resource.path === model._associatedResource.path);
                const errors = fileErrors.map(marker => ({
                    line: marker.startLineNumber,
                    column: marker.startColumn,
                    message: marker.message,
                }));
                if(!sameErrors(projectErrors[fileId], errors)){
                    projectErrors = errors;
                    fileErrorsList.push({fileId, fileName: model.file.name, project: model.file.project, errors});
                }
            }
            if(fileErrorsList.length)
                window.onErrorChange(fileErrorsList);
        }
    });

    window.setErrors = (errors) => {
        projectErrors = errors;
    }

    window.openFile = (file) => {
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

    window.resize = () => {
        editor.layout();
    }

    window.setTheme = (theme) => {
        monaco.editor.setTheme(theme);
    }

    window.focus = () => {
        if(activeEditor)
            activeEditor.focus();
    }

    window.onContentChange = (fileId, content) => {};
    window.onErrorChange = (fileId, errors) => {};
    window.onStateChange = (fileId, state) => {};
});

function getModel(file){
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

function sameMarker(a, b){
    return (
        a.code === b.code &&
        a.startColumn === b.startColumn &&
        a.startLineNumber === b.startLineNumber &&
        a.message === b.message &&
        a.resource.path === b.resource.path
    );
}

function sameMarkers(a, b){
    if(!a || !b || a.length !== b.length)
        return false;
    for(let i = 0; i < a.length; i++){
        if(!sameMarker(a[i], b[i]))
            return false;
    }
    return true;
}

function sameError(a, b){
    return (
        a.line === b.line &&
        a.column === b.column &&
        a.message === b.message
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