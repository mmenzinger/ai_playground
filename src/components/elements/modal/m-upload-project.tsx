import { useState, forwardRef } from 'react';
import { Modal } from '@elements/modal';
import { Project } from '@store';
import db from '@localdb';
import JSZip from 'jszip';
import store from '@store';
import { BasicFile } from '@src/scenario-utils';

export const UploadProjectModal = forwardRef((_props: {} = {}, ref: React.Ref<HTMLDialogElement>) => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [name, setName] = useState('');
    const [includeGlobals, setIncludeGlobals] = useState(false);
    const [overwriteGlobals, setOverwriteGlobals] = useState(false);
    const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
    const [projectData, setProjectData] = useState<{
        settings: Project;
        projectFiles: BasicFile[];
        globalFiles: BasicFile[];
    } | null>(null);

    async function onFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setSelectedFile(file);
            const zipData = await loadZipFile(file);
            setProjectData(zipData);
            setName(zipData.settings.name || '');
        } catch (error) {
            setError(`Failed to read zip file: ${String(error)}`);
            setSelectedFile(null);
            setProjectData(null);
        }
    }

    async function onSubmit(): Promise<any | undefined> {
        if (!projectData || !name.length) {
            setError('Please select a valid zip file and provide a project name');
            return undefined;
        }

        try {
            // Check if project name already exists
            if (await db.projectExists(name)) {
                setError(`Project with name '${name}' already exists!`);
                return undefined;
            }

            return await store.project.importProject(
                {...projectData.settings, name},
                projectData.projectFiles,
                includeGlobals ? projectData.globalFiles : [],
                overwriteGlobals
            );
        } catch (error: any) {
            if (error?.name === 'ConstraintError') {
                setError(`Project with name '${name}' already exists!`);
                console.warn(error);
            } else {
                setError(String(error));
            }
            return undefined;
        }
    }

    return (
        <Modal ref={ref} title="Upload Project" submitName="upload" onSubmit={onSubmit} error={error}>
            <>
                <label className="label cursor-pointer" htmlFor="file">Select Zip File</label>
                <input
                    type="file" 
                    className="file-input file-input-lg w-full" 
                    accept=".zip"
                    onChange={onFileSelect}
                />

                {selectedFile && (
                    <>
                        <label className="label cursor-pointer" htmlFor="name">Project Name</label>
                        <input
                            className="input input-lg w-full"
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.trim())}
                            placeholder="My Project"
                        />

                        <div className="mt-4 space-y-2">
                            {projectData && projectData.globalFiles.length > 0 && (
                                <>
                                    <label className="label cursor-pointer justify-start">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            checked={includeGlobals}
                                            onChange={(e) => setIncludeGlobals(e.target.checked)}
                                        />
                                        <span className="ml-2">Include global files</span>
                                    </label>

                                    {includeGlobals && (
                                        <label className="label cursor-pointer justify-start ml-6">
                                            <input
                                                type="checkbox"
                                                className="checkbox"
                                                checked={overwriteGlobals}
                                                onChange={(e) => setOverwriteGlobals(e.target.checked)}
                                            />
                                            <span className="ml-2">Overwrite existing global files</span>
                                        </label>
                                    )}
                                </>
                            )}
                        </div>

                        {projectData && (
                            <div className="mt-4 p-4 bg-base-200 rounded">
                                <h4 className="font-semibold">Project Info:</h4>
                                <p>Project Files: {projectData.projectFiles.filter(f => f.content !== undefined).length}</p>
                                {projectData.globalFiles.length > 0 && (
                                    <p>Global Files: {projectData.globalFiles.filter(f => f.content !== undefined).length}</p>
                                )}
                                <p>Scenario: {projectData.settings.scenario || 'default'}</p>
                            </div>
                        )}
                    </>
                )}
            </>
        </Modal>
    );
});

async function loadZipFile(file: globalThis.File): Promise<{
    settings: Project;
    projectFiles: BasicFile[];
    globalFiles: BasicFile[];
}> {
    const zipData = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(zipData);

    // Load settings
    const settingsFile = zip.file('settings.json');
    if (!settingsFile) {
        throw new Error('Invalid project file: missing settings.json');
    }
    
    const settingsText = await settingsFile.async('text');
    const settings: Project = JSON.parse(settingsText);

    // Load files
    const projectFiles: BasicFile[] = [];
    const globalFiles: BasicFile[] = [];
    for(const file of Object.values(zip.files)) {
        if(!file.dir) {
            if(file.name.startsWith('project/')) {
                projectFiles.push({ 
                    path: file.name.replace('project/', ''),
                    content: await getFileContent(file, file.name),
                });
            }
            else if(file.name.startsWith('global/')) {
                globalFiles.push({
                    path: file.name.replace('global/', ''),
                    content: await getFileContent(file, file.name),
                });
            }
            else if(file.name !== 'settings.json') {
                throw new Error(`Invalid project file - invalid file path ${file.name}`);
            }
        }
    }

    return {
        settings,
        projectFiles,
        globalFiles,
    };
}

async function getFileContent(zipFile: JSZip.JSZipObject, filename: string): Promise<string | Blob> {
    // Handle text files
    if(/\.(js|json|md|pl)$/.test(filename)) {
        return await zipFile.async('text');
    }
    // Handle other file types
    else {
        return await zipFile.async('blob');
    }
}
