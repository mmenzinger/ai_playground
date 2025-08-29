import { useState, useRef, useEffect } from 'react';
import MonacoEditor, { Monaco, loader } from '@monaco-editor/react';
import { Uri, editor } from 'monaco-editor';
import store, { File, Project } from '@store';
import { prologTokensProvider } from './prolog';
import { autorun } from 'mobx';
import db from '@localdb';
import { Defer } from '@utils';

const LIB_FILES = [
    {path: '/lib/utils.js', def: '/lib/utils.d.ts'},
];

type Theme = 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
const THEME: Record<string, Theme> = {
    DARK: 'hc-black',
    LIGHT: 'hc-light',
};

const OPTIONS = {
    selectOnLineNumbers: true,
    automaticLayout: true,
    fontSize: 14,
    scrollBeyondLastLine: false,
    scrollBeyondLastColumn: 1,
    roundedSelection: false,
    mouseWheelZoom: true,
    minimap: {
        enabled: false,
    },
    lineNumbersMinChars: 3,
    // wordWrap: 'on',
    // model: null,
    // fix overlay on top sometimes hidden
    fixedOverflowWidgets: true,
};

// Configure Monaco loader for local use with absolute URLs
loader.config({ 
    paths: { 
        vs: `${window.location.origin}/node_modules/monaco-editor/min/vs` 
    } 
});

export function Editor(props: { project: Project }) {
    const [value, setValue] = useState('');

    const internals = useRef<{
        editor: Defer<editor.IStandaloneCodeEditor>;
        monaco: Defer<Monaco>;
        theme: Theme;
        file: File | null;
        markerDebounceTimeout?: NodeJS.Timeout;
    }>({
        editor: new Defer<editor.IStandaloneCodeEditor>(),
        monaco: new Defer<Monaco>(),
        theme: 'vs',
        file: null,
    });

    useEffect(() => {
        const styleDisposer = autorun(async () => {
            const dark = store.settings.getLocal('dark-theme', false);
            internals.current.theme = dark ? THEME.DARK : THEME.LIGHT;
            const monaco = await internals.current.monaco.promise;
            if (monaco) {
                monaco.editor.setTheme(internals.current.theme);
            }
        });

        const fileUpdateDisposer = autorun(async () => {
            const newFile = store.project.activeFile;
            if (newFile) {
                openFile(newFile);
            }
        });
        
        return () => {
            styleDisposer();
            fileUpdateDisposer();
            console.log("Editor cleanup!")
        };
    }, []);

    //#########################################################################
    // event handlers
    //#########################################################################

    //-------------------------------------------------------------------------
    // will mount
    function editorWillMount(monaco: Monaco) {
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
            paths: {
                '@/*': ['./'],
                'lib/*': ['/lib/*'],
            },
            baseUrl: './',
        });

        monaco.languages.register({ id: 'prolog' });
        monaco.languages.setMonarchTokensProvider('prolog', prologTokensProvider);

        for(const file of LIB_FILES) {
            fetch(file.def).then((res) => res.text()).then((content) => {
                monaco.languages.typescript.javascriptDefaults.addExtraLib(
                    content,
                    file.path
                );
            });
        }
    }

    //-------------------------------------------------------------------------
    // like the old onDidMount
    function onMount(
        editor: editor.IStandaloneCodeEditor,
        monaco: Monaco
    ) {
        console.log("Editor did mount")
        internals.current.editor.resolve(editor);
        internals.current.monaco.resolve(monaco);

        // Apply current theme immediately on mount
        monaco.editor.setTheme(internals.current.theme);

        Promise.all([
            db.getProjectFiles(props.project.id),
            db.getProjectFiles(0)
        ]).then(array => {
            const files = [...array[0], ...array[1]]
                .filter((file) => typeof file.content === 'string');
            openProject(props.project, files);
        });

        // Create models for lib files
        // switched from extraLibs to Models as the different methods
        // led to parsing errors of the editor, requiring leading / to resolve
        // for(const file of LIB_FILES.ALWAYS) {
        //     const uri = monaco.Uri.parse(file.path);
        //     if (!monaco.editor.getModel(uri)) {
        //         fetch(file.def).then((res) => res.text()).then((content) => {
        //             monaco.editor.createModel(content, 'javascript', uri);
        //         });
        //     }
        // }

        editor.onDidChangeCursorSelection((_) => {
            if (!internals.current.file?.id)
                return;

            store.project.saveFileState(
                internals.current.file.id,
                editor.saveViewState()
            );
        });

        editor.onDidScrollChange((_) => {
            if (!internals.current.file?.id) return;

            store.project.saveFileState(
                internals.current.file.id,
                editor.saveViewState()
            );
        });

        editor.onDidChangeModelDecorations((_) => {
            // debounce activation
            clearTimeout(internals.current.markerDebounceTimeout);
            internals.current.markerDebounceTimeout = setTimeout(() => {
                markersUpdated();
            }, 500);
        });
    }

    //-------------------------------------------------------------------------
    // on change
    function onChange(
        value: string | undefined,
        _: editor.IModelContentChangedEvent
    ) {
        setValue(value || '');
        const file = store.project.activeFile;
        if (file) {
            store.project.saveFileContent(file.id, value || '');
        }
    }

    

    //#########################################################################
    // helper functions
    //#########################################################################
    
    //-------------------------------------------------------------------------
    // create model
    async function createModel(file: File, uri: Uri) {
        if (file.content instanceof Blob) {
            return null;
        }
        const monaco = await internals.current.monaco.promise;

        let language = 'javascript';
        const ending = file.name.match(/\.([a-z]+)$/);
        if (ending) {
            switch (ending[1]) {
                case 'js':
                    language = 'javascript';
                    break;
                case 'json':
                    language = 'json';
                    break;
                case 'pl':
                    language = 'prolog';
                    break;
                case 'md':
                    language = 'markdown';
                    break;
                case 'html':
                    language = 'html';
                    break;
            }
        }

        const model = monaco.editor.createModel(
            file.content || '',
            language,
            uri
        );
        return model;
    }

    //-------------------------------------------------------------------------
    // open project
    async function openProject(_: Project, files: File[], initialFile?: File) {
        const monaco = await internals.current.monaco.promise;

        // load files
        for (const file of files) {
            const virtualPath = 'project/' + file.path;
            const uri = monaco.Uri.parse(virtualPath);
            let model = monaco.editor.getModel(uri);
            if (!model) {
                model = await createModel(file, uri);
            } else {
                if (!(file.content instanceof Blob)) {
                    model.setValue(file.content || '');
                }
            }
        }

        if (initialFile) {
            openFile(initialFile);
        }
    }

    //-------------------------------------------------------------------------
    // open file
    async function openFile(file: File) {
        const monaco = await internals.current.monaco.promise;
        const editor = await internals.current.editor.promise;
        
        // if the file is already open, just focus it
        if(file.id && file.id === internals.current.file?.id) {
            console.log("file is already open", file.id, internals.current.file.id);
            editor.focus();
            return;
        }

        if (file.content instanceof Blob) return;

        try {
            if (internals.current.file) {
                internals.current.file.state =
                    editor.saveViewState() || undefined;
            }
            internals.current.file = file;

            let path;
            if (file.id) {
                path = (file.projectId ? '/project/' : '/global/') + file.path;
            } else {
                path = file.path;
            }
            const uri = monaco.Uri.parse(path);
            let model = monaco.editor.getModel(uri);
            if (!model) {
                model = await createModel(file, uri);
                if (!model) {
                    console.error(file);
                    throw Error(`could not open file!`);
                }
            }

            model.setValue(file.content || '');
            editor.setModel(model);

            if (file.state) {
                // temp fix for issue https://github.com/microsoft/monaco-editor/issues/4904
                delete file.state.contributionsState["editor.contrib.wordHighlighter"];
                editor.restoreViewState(file.state);
            }

            if (file.id) {
                editor.updateOptions({ readOnly: false });
            } else {
                editor.updateOptions({ readOnly: true });
            }

            editor.focus();
        } catch (error) {
            console.error('Error opening file:', error);
        }
    }

    //-------------------------------------------------------------------------
    // markers updated
    async function markersUpdated() {
        if(internals.current.file){
            console.log("markers updated");
            const monaco = await internals.current.monaco.promise;

            const markers: editor.IMarker[] = monaco.editor.getModelMarkers({});
            const fileMarkers = markers.filter((marker) => {
                return marker.severity === 8 && marker.resource.path.endsWith(internals.current.file?.path || '');
            });
            if(fileMarkers.length > 0) {
                if(!store.project.fileErrors.has(internals.current.file.id)) {
                    store.project.setFileErrors(internals.current.file.id, fileMarkers);
                }
            }
            else{
                if(store.project.fileErrors.has(internals.current.file.id)) {
                    store.project.setFileErrors(internals.current.file.id, []);
                }
            }
        }
    }

    return (
        <MonacoEditor
            defaultLanguage="javascript"
            options={OPTIONS}
            value={value}
            onChange={onChange}
            onMount={onMount}
            beforeMount={editorWillMount}
        />
    );
}

export default Editor;