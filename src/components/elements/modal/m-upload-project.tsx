import { useState, forwardRef } from 'react';
import { Modal } from '@elements/modal';
import { Project, File } from '@store';
import db from '@localdb';
import JSZip from 'jszip';
import { Input, Checkbox, FileInput } from 'react-daisyui';
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
        projectFiles: File[];
        globalFiles: File[];
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
        if (!projectData || !name.trim()) {
            setError('Please select a valid zip file and provide a project name');
            return undefined;
        }

        try {
            // Check if project name already exists
            if (await db.projectExists(name)) {
                setError(`Project with name '${name}' already exists!`);
                return undefined;
            }

            // Create the project
            const basicFiles = convertToBasicFiles(projectData.projectFiles);
            const project = await store.project.createProject(
                name,
                projectData.settings.scenario || 'default',
                basicFiles
            );

            // Add global files if requested
            // TODO: implement global file handling
            return project;
        } catch (error: any) {
            if (error?.name === 'ConstraintError') {
                setError(`Project with name '${name}' already exists!`);
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
                <FileInput 
                    className="w-full" 
                    size="lg" 
                    accept=".zip"
                    onChange={onFileSelect}
                />

                {selectedFile && (
                    <>
                        <label className="label cursor-pointer" htmlFor="name">Project Name</label>
                        <Input 
                            className="w-full" 
                            size="lg" 
                            id="name" 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Project"
                        />

                        <div className="mt-4 space-y-2">
                            {projectData && projectData.globalFiles.length > 0 && (
                                <>
                                    <label className="label cursor-pointer justify-start">
                                        <Checkbox 
                                            checked={includeGlobals} 
                                            onChange={(e) => setIncludeGlobals(e.target.checked)}
                                        />
                                        <span className="ml-2">Include global files</span>
                                    </label>

                                    {includeGlobals && (
                                        <label className="label cursor-pointer justify-start ml-6">
                                            <Checkbox 
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
    projectFiles: File[];
    globalFiles: File[];
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

    // Load project files
    const projectFiles: File[] = [];
    const projectFolder = zip.folder('project');
    if (projectFolder) {
        // Check if the project folder actually contains any files
        const hasProjectFiles = Object.keys(projectFolder.files).some(path => 
            path.startsWith('project/') && !projectFolder.files[path].dir
        );
        
        if (hasProjectFiles) {
            await processZipFolder(projectFolder, projectFiles);
        }
    }

    // Load global files
    const globalFiles: File[] = [];
    const globalFolder = zip.folder('global');
    if (globalFolder) {
        // Check if the global folder actually contains any files
        const hasGlobalFiles = Object.keys(globalFolder.files).some(path => 
            path.startsWith('global/') && !globalFolder.files[path].dir
        );
        
        if (hasGlobalFiles) {
            await processZipFolder(globalFolder, globalFiles);
        }
    }

    return {
        settings,
        projectFiles,
        globalFiles,
    };
}

async function getFileContent(zipFile: JSZip.JSZipObject, filename: string): Promise<string | Blob> {
    // Handle binary files (images, etc.)
    if (/\.(png|jpe?g)$/i.test(filename)) {
        return await zipFile.async('blob');
    }
    // Handle text files
    return await zipFile.async('text');
}

function convertToBasicFiles(files: File[]): BasicFile[] {
    // Separate folders and files
    const folders = files.filter(f => f.content === undefined);
    const regularFiles = files.filter(f => f.content !== undefined);
    
    // Create a map to build the hierarchy
    const fileMap = new Map<number, BasicFile>();
    const rootFiles: BasicFile[] = [];
    
    // First pass: create all folder entries
    for (const folder of folders) {
        const basicFile: BasicFile = {
            name: folder.name,
            content: [], // Folders have array content
        };
        fileMap.set(folder.id, basicFile);
        
        if (folder.parentId === 0) {
            rootFiles.push(basicFile);
        }
    }
    
    // Second pass: create file entries and place them in their parent folders
    for (const file of regularFiles) {
        const basicFile: BasicFile = {
            name: file.name,
            content: file.content || '',
        };
        
        if (file.parentId === 0) {
            rootFiles.push(basicFile);
        } else {
            const parentFolder = fileMap.get(file.parentId);
            if (parentFolder && Array.isArray(parentFolder.content)) {
                parentFolder.content.push(basicFile);
            }
        }
    }
    
    // Third pass: place child folders in their parent folders
    for (const folder of folders) {
        if (folder.parentId !== 0) {
            const parentFolder = fileMap.get(folder.parentId);
            const currentFolder = fileMap.get(folder.id);
            if (parentFolder && currentFolder && Array.isArray(parentFolder.content)) {
                parentFolder.content.push(currentFolder);
            }
        }
    }
    
    return rootFiles;
}

async function processZipFolder(folder: JSZip, files: File[]): Promise<void> {
    // First, create directory entries for all folders and track their IDs
    const directories = new Set<string>();
    const pathToIdMap = new Map<string, number>();
    let currentId = 1;
    
    // Root folder (empty path) has parentId 0
    pathToIdMap.set('', 0);
    
    for (const [relativePath, zipFile] of Object.entries(folder.files)) {
        if (!zipFile.dir) {
            // Extract the clean path (remove the base folder name like 'project/')
            const cleanPath = relativePath.replace(/^[^/]+\//, '');
            const fileName = cleanPath.split('/').pop() || cleanPath;
            
            // Skip settings.json as it's project metadata, not a project file
            if (fileName === 'settings.json') {
                continue;
            }
            
            // Add all parent directories to the set
            const pathParts = cleanPath.split('/');
            for (let i = 0; i < pathParts.length - 1; i++) {
                const dirPath = pathParts.slice(0, i + 1).join('/');
                directories.add(dirPath);
            }
        }
    }
    
    // Sort directories by depth (shortest paths first) to create parent folders before children
    const sortedDirectories = Array.from(directories).sort((a, b) => a.split('/').length - b.split('/').length);
    
    // Create directory entries with proper parent relationships
    for (const dirPath of sortedDirectories) {
        const dirName = dirPath.split('/').pop() || dirPath;
        const parentPath = dirPath.split('/').slice(0, -1).join('/');
        const parentId = pathToIdMap.get(parentPath) || 0;
        
        const dirId = currentId++;
        pathToIdMap.set(dirPath, dirId);
        
        files.push({
            id: dirId,
            projectId: 0,
            parentId: parentId,
            name: dirName,
            path: dirPath,
            content: undefined, // Directories have no content
        });
    }
    
    // Then process all files with correct parent IDs
    for (const [relativePath, zipFile] of Object.entries(folder.files)) {
        if (!zipFile.dir) {
            const cleanPath = relativePath.replace(/^[^/]+\//, '');
            const fileName = cleanPath.split('/').pop() || cleanPath;
            
            // Skip settings.json as it's project metadata, not a project file
            if (fileName === 'settings.json') {
                continue;
            }
            
            // Find the parent folder ID
            const parentPath = cleanPath.split('/').slice(0, -1).join('/');
            const parentId = pathToIdMap.get(parentPath) || 0;
            
            const content = await getFileContent(zipFile, fileName);
            files.push({
                id: currentId++,
                projectId: 0,
                parentId: parentId,
                name: fileName,
                path: cleanPath,
                content: content,
            });
        }
    }
}
