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

    editor.setLanguage = function(lang){
        const model = editor.getModel();
        monaco.editor.setModelLanguage(model, lang);
    }

    window.editor = editor;
});
/*
function dispatchMouseEvent(event){
    parent.dispatchEvent(new MouseEvent(event.type, event));
}

onmousemove = dispatchMouseEvent;
onmousedown = dispatchMouseEvent;
onmouseup = dispatchMouseEvent;
onmouseover = dispatchMouseEvent;
onmouseenter = dispatchMouseEvent;
*/