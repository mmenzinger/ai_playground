require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});
require(['vs/editor/editor.main'], function() {
    const editor = monaco.editor.create(document.getElementById('container'), {
        value: '',
        language: 'plain_text',
        fontSize: '12px',
        scrollBeyondLastLine: false,
        scrollBeyondLastColumn: false,
        roundedSelection: false,
        theme: 'vs',
        mouseWheelZoom: true,
        minimap: {
            enabled: false,
        },
        lineNumbersMinChars: 3,
    });

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

    let errorMarkerCallback = null;
    let errorMarkerSkip = false; // skip first update after content change
    editor.onErrorMarkerChange = (callback) => {
        callback.lastErrorMarkers = "";
        errorMarkerCallback = callback;
        errorMarkerSkip = true;
    }

    editor.onDidChangeModelDecorations(() => {
        const model = editor.getModel();
        if (model === null || model.getModeId() !== "javascript")
            return;
    
        const owner = model.getModeId();
        const markers = monaco.editor.getModelMarkers({ owner });

        if(errorMarkerSkip){
            errorMarkerSkip = false;
        }
        else if(errorMarkerCallback){
            const newErrorMarkers = JSON.stringify(markers);
            if(errorMarkerCallback.lastErrorMarkers !== newErrorMarkers){
                errorMarkerCallback.lastErrorMarkers = newErrorMarkers;
                const errorMarkers = markers.filter(marker => marker.severity === 8);
                errorMarkerCallback(errorMarkers);
            }
        }
    });

    editor.setLanguage = (lang) => {
        const model = editor.getModel();
        monaco.editor.setModelLanguage(model, lang);
    }

    editor.setTheme = (theme) => {
        monaco.editor.setTheme(theme);
    }

    window.editor = editor;
});