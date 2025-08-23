import { useState, useRef, useEffect } from 'react';
import MonacoEditor, { Monaco, loader } from '@monaco-editor/react';
import { Uri, editor, languages, MarkerSeverity } from 'monaco-editor';
import store, { File, FileError, Project, ProjectErrors } from '@store';
import { prologTokensProvider } from './prolog';
import { isString } from 'lodash-es';
import { autorun } from 'mobx';
import db from '@localdb';

const LIB_FILES = [
    '/lib/utils.js',
    '/lib/prolog.js',
    '/lib/tensorflow.js',
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

export function Editor() {
    const [value, setValue] = useState('');

    const internals = useRef<{
        editor: editor.IStandaloneCodeEditor | null;
        monaco: Monaco | null;
        theme: Theme;
        file: File | null;
        modelFiles: Map<string, File>; // model.id => File
        lastMarkers: editor.IMarker[] | null;
        projectErrors: ProjectErrors;
        firstErrorUpdate: boolean;
        autorunDisposer: (() => void) | null;
        isDisposed: boolean;
    }>({
        editor: null,
        monaco: null,
        theme: 'vs',
        file: null,
        modelFiles: new Map(),
        lastMarkers: null,
        projectErrors: {},
        firstErrorUpdate: true,
        autorunDisposer: null,
        isDisposed: false,
    });

    useEffect(() => {
        const disposer = autorun(() => {
            const dark = store.settings.getLocal('dark-theme', false);
            internals.current.theme = dark ? THEME.DARK : THEME.LIGHT;
            const monaco = internals.current.monaco;
            if (monaco) {
                monaco.editor.setTheme(internals.current.theme);
            }
        });
        return () => {
            disposer();
            // Cleanup when component unmounts
            internals.current.isDisposed = true;
            
            if (internals.current.autorunDisposer) {
                internals.current.autorunDisposer();
                internals.current.autorunDisposer = null;
            }
            
            // Clear model mappings with null checks
            if (internals.current.modelFiles) {
                internals.current.modelFiles.clear();
            }
            
            if (internals.current.editor) {
                try {
                    internals.current.editor.dispose();
                } catch (error) {
                    console.warn('Error disposing Monaco Editor:', error);
                }
                internals.current.editor = null;
            }
        };
    }, []);

    useEffect(() => {
        // update theme
        return 
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
            },
            baseUrl: './',
        });

        monaco.languages.register({ id: 'prolog' });
        monaco.languages.setMonarchTokensProvider('prolog', prologTokensProvider);
    }

    //-------------------------------------------------------------------------
    // did mount
    function editorDidMount(
        editor: editor.IStandaloneCodeEditor,
        monaco: Monaco
    ) {
        internals.current.editor = editor;
        internals.current.monaco = monaco;
        
        let file: File;
        let project: Project;

        // Apply current theme immediately on mount
        monaco.editor.setTheme(internals.current.theme);
        // editor.updateOptions({
        //     fontFamily: 'Roboto Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        // });

        // Store the autorun disposer for cleanup
        internals.current.autorunDisposer = autorun(async () => {
            // Early exit if disposed
            if (internals.current.isDisposed) {
                return;
            }

            const newFile = store.project.activeFile;
            const newProject = store.project.activeProject;

            try {
                // Create models for lib files
                // switched from extraLibs to Models as the different methods
                // led to parsing errors of the editor, requiring leading / to resolve
                for(const file of LIB_FILES) {
                    const uri = monaco.Uri.parse(file);
                    if (!monaco.editor.getModel(uri)) {
                        const content = await fetch(file).then((res) => res.text());
                        monaco.editor.createModel(content, 'javascript', uri);
                    }
                }
                
            } catch (error) {
                console.error('Failed to load library utilities:', error);
                return;
            }

            if (newProject !== project && newProject && !internals.current.isDisposed) {
                project = newProject;
                let files = await db.getProjectFilesResolved(project.id);
                if (internals.current.isDisposed) return; // Check again after async operation
                
                files = [
                    ...files,
                    ...(await db.getProjectFilesResolved(0)),
                ].filter((file) => typeof file.content === 'string');
                
                if (!internals.current.isDisposed) {
                    openProject(project, files);
                }
            }
            if (newFile !== file && newFile && !internals.current.isDisposed) {
                file = newFile;
                openFile(file);
            }
        });

        editor.onDidChangeCursorSelection((_) => {
            if (internals.current.isDisposed || !internals.current.file?.id) return;
            
            store.project.saveFileState(
                internals.current.file.id,
                editor.saveViewState()
            );
        });
        editor.onDidScrollChange((_) => {
            if (internals.current.isDisposed || !internals.current.file?.id) return;
            
            store.project.saveFileState(
                internals.current.file.id,
                editor.saveViewState()
            );
        });

        editor.onDidChangeModelDecorations((_) => {
            if (internals.current.isDisposed) return;
            
            // Use setTimeout to ensure the DOM is ready before updating markers
            setTimeout(() => {
                if (!internals.current.isDisposed) {
                    markersUpdated();
                }
            }, 0);
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
    function createModel(file: File, uri: Uri) {
        if (file.content instanceof Blob || internals.current.isDisposed || !internals.current.monaco) {
            return null;
        }

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

        try {
            // Verify the language is registered before creating model
            const registeredLanguages = internals.current.monaco.languages.getLanguages();
            const isLanguageRegistered = registeredLanguages.some(lang => lang.id === language);
            
            if (!isLanguageRegistered) {
                console.warn(`Language '${language}' not registered, falling back to plaintext`);
                language = 'plaintext';
            }

            const model = internals.current.monaco.editor.createModel(
                file.content || '',
                language,
                uri
            );
            
            return model;
        } catch (error) {
            console.error('Error creating model:', error);
            return null;
        }
    }

    //-------------------------------------------------------------------------
    // open project
    function openProject(_: Project, files: File[], initialFile?: File) {
        if (internals.current.isDisposed || !internals.current.monaco) {
            console.warn('Cannot open project: editor is disposed or Monaco is not initialized');
            return;
        }

        internals.current.projectErrors = {};
        if (internals.current.modelFiles) {
            internals.current.modelFiles.clear();
        }

        // preload files
        const modelsValidated = [];
        for (const file of files) {
            if (internals.current.isDisposed) break; // Check during loop
            
            // console.log(file);
            const virtualPath = 'project/' + file.path;
            const uri = internals.current.monaco.Uri.parse(virtualPath);
            let model = internals.current.monaco.editor.getModel(uri);
            // console.log(uri);
            if (!model) {
                model = createModel(file, uri);
                // internals.current.monaco.languages.typescript.javascriptDefaults.addExtraLib(`export * from '${virtualPath}';`, `/${virtualPath}`);
            } else {
                if (!(file.content instanceof Blob)) {
                    model.setValue(file.content || '');
                }
            }
            if (model) {
                modelsValidated.push(validateModel(model));
                internals.current.modelFiles.set(model.id, file);
            }
        }
        Promise.all(modelsValidated).then((_) => {
            if (!internals.current.isDisposed) {
                // Use setTimeout to ensure the DOM is ready before updating markers
                setTimeout(() => {
                    if (!internals.current.isDisposed) {
                        markersUpdated();
                    }
                }, 100);
            }
        }).catch(error => {
            if (!internals.current.isDisposed) {
                console.error('Error validating models:', error);
            }
        });

        if (initialFile && !internals.current.isDisposed) {
            openFile(initialFile);
        }
    }

    //-------------------------------------------------------------------------
    // open file
    function openFile(file: File) {
        if (internals.current.isDisposed || !internals.current.monaco) {
            console.warn('Cannot open file: editor is disposed or Monaco is not initialized');
            return;
        }

        if (file.content instanceof Blob) return;

        if (!file) {
            console.warn('tried to open non existing file');
            return;
        }

        try {
            if (internals.current.file) {
                internals.current.file.state =
                    internals.current.editor?.saveViewState() || undefined;
            }
            internals.current.file = file;

            let path;
            if (file.id) {
                path = (file.projectId ? '/project/' : '/global/') + file.path;
            } else {
                path = file.path;
            }
            const uri = internals.current.monaco.Uri.parse(path);
            let model = internals.current.monaco.editor.getModel(uri);
            if (!model) {
                model = createModel(file, uri);
            }
            if (!model) {
                console.error(file);
                throw Error(`could not open file!`);
            }
            
            // Check disposal again before setting model
            if (internals.current.isDisposed) {
                console.warn('Editor disposed while opening file');
                return;
            }
            
            model.setValue(file.content || '');
            internals.current.editor?.setModel(model);

            if (file.state) {
                internals.current.editor?.restoreViewState(file.state);
            }

            if (file.id) {
                internals.current.editor?.updateOptions({ readOnly: false });
            } else {
                internals.current.editor?.updateOptions({ readOnly: true });
            }

            internals.current.editor?.focus();
        } catch (error) {
            if (!internals.current.isDisposed) {
                console.error('Error opening file:', error);
            }
        }
    }

    //-------------------------------------------------------------------------
    // markers updated
    function markersUpdated() {
        // Safety check: ensure Monaco Editor and its editor instance are fully initialized
        if (!internals.current.monaco || !internals.current.editor || internals.current.isDisposed) {
            console.warn('markersUpdated called but editor is not ready or disposed');
            return;
        }

        try {
            const markers: editor.IMarker[] =
                internals.current.monaco.editor.getModelMarkers({});
            const errorMarkers = markers.filter(
                (marker) => marker.severity === 8
            );
            
            if (
                !internals.current.lastMarkers ||
                !sameMarkers(internals.current.lastMarkers, errorMarkers)
            ) {
                let errorsChanged = false;
                internals.current.lastMarkers = errorMarkers;
                const models = internals.current.monaco.editor.getModels();
                
                // Clear existing project errors before processing
                const newProjectErrors: ProjectErrors = {};
                
                for (const model of models) {
                    if (internals.current.isDisposed) break; // Check during loop
                    
                    try {
                        const fileErrors = errorMarkers.filter(
                            (marker) =>
                                marker.resource.path ===
                                (model as any)._associatedResource?.path
                        );
                        
                        const file = internals.current.modelFiles?.get(model.id);
                        if (file && file.id) {
                            const errors: FileError[] = fileErrors.map(
                                (marker): FileError => ({
                                    caller: {
                                        fileId: file.id,
                                        fileName: file.name,
                                        projectId: file.projectId,
                                        line: marker.startLineNumber,
                                        column: marker.startColumn,
                                        functionNames: [],
                                    },
                                    args: [marker.message],
                                })
                            );
                            
                            if (
                                !sameErrors(
                                    internals.current.projectErrors[file.id] || [],
                                    errors
                                )
                            ) {
                                newProjectErrors[file.id] = errors;
                                errorsChanged = true;
                            } else {
                                // Keep existing errors if they haven't changed
                                newProjectErrors[file.id] = internals.current.projectErrors[file.id] || [];
                            }
                        } else if (fileErrors.length > 0) {
                            // Only warn if there are actual errors for this model
                            console.debug('Markers found for model without loaded file:', model.uri.path);
                        }
                    } catch (error) {
                        console.warn('Error processing model markers:', error);
                    }
                }
                
                // Update project errors
                internals.current.projectErrors = newProjectErrors;
                
                if (errorsChanged && !internals.current.isDisposed) {
                    if (internals.current.firstErrorUpdate) {
                        internals.current.firstErrorUpdate = false;
                        if (store.project.activeFile) {
                            openFile(store.project.activeFile);
                        }
                    }
                    if (store.project.activeProject) {
                        store.project.updateProjectErrors(
                            store.project.activeProject.id,
                            internals.current.projectErrors
                        );
                    }
                }
            }
        } catch (error) {
            if (!internals.current.isDisposed) {
                console.error('Error in markersUpdated:', error);
            }
        }
    }

    //-------------------------------------------------------------------------
    // validate model
    async function validateModel(
        model: editor.ITextModel,
        getWorker?: (
            ...uris: Uri[]
        ) => Promise<languages.typescript.TypeScriptWorker>
    ) {
        // Early exit if disposed or model is invalid
        if (internals.current.isDisposed || !internals.current.monaco || !model || model.isDisposed()) {
            return;
        }

        try {
            const owner = model.getLanguageId();
            if (owner === 'javascript' || owner === 'typescript') {
                if (getWorker === undefined) {
                    getWorker = await languages.typescript.getJavaScriptWorker();
                }
                
                // Check disposal again after async operation
                if (internals.current.isDisposed || model.isDisposed()) {
                    return;
                }
                
                const worker = await getWorker(model.uri);
                
                // Check disposal again after async operation
                if (internals.current.isDisposed || model.isDisposed()) {
                    return;
                }
                
                const diagnostics = (
                    await Promise.all([
                        worker.getSyntacticDiagnostics(model.uri.toString()),
                        worker.getSemanticDiagnostics(model.uri.toString()),
                    ])
                ).reduce((a, it) => a.concat(it));

                // Check disposal again after async operation
                if (internals.current.isDisposed || model.isDisposed()) {
                    return;
                }

                const markers = diagnostics.map((d) => {
                    const start = model.getPositionAt(d.start || 0);
                    const end = model.getPositionAt(
                        (d.start || 0) + (d.length || 0)
                    );
                    return {
                        severity: MarkerSeverity.Error,
                        startLineNumber: start.lineNumber,
                        startColumn: start.column,
                        endLineNumber: end.lineNumber,
                        endColumn: end.column,
                        message: flattenMessageChain(d.messageText),
                    };
                });

                if (!internals.current.isDisposed && internals.current.monaco && !model.isDisposed()) {
                    internals.current.monaco.editor.setModelMarkers(
                        model,
                        owner,
                        markers
                    );
                }
            }
        } catch (error) {
            if (!internals.current.isDisposed) {
                console.warn('Error validating model:', error);
            }
        }
    }


    return (
        <MonacoEditor
            defaultLanguage="javascript"
            options={OPTIONS}
            value={value}
            onChange={onChange}
            onMount={editorDidMount}
            beforeMount={editorWillMount}
        />
    );
}

//#############################################################################
// utility functions
//#############################################################################

function flattenMessageChain(
    chain: string | languages.typescript.DiagnosticMessageChain
): string {
    if (isString(chain)) return chain;
    else {
        return chain.messageText;
    }
}

function sameMarker(a: editor.IMarker, b: editor.IMarker) {
    return (
        a.code === b.code &&
        a.startColumn === b.startColumn &&
        a.startLineNumber === b.startLineNumber &&
        a.message === b.message &&
        a.resource.path === b.resource.path
    );
}

function sameMarkers(a: editor.IMarker[], b: editor.IMarker[]) {
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (!sameMarker(a[i], b[i])) return false;
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
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (!sameError(a[i], b[i])) return false;
    }
    return true;
}

export default Editor;