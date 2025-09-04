import { useState, forwardRef, JSX, useEffect } from 'react';
import { Modal } from '@elements/modal';
import db from '@localdb';
import store from '@store';
import { NestedFile } from '@src/scenario-utils';

const SUPPORTED_FILE_EXT = ['png', 'js', 'json', 'md', 'pl', 'html'];
const UNSUPPORTED_CHARACTERS = /[^a-zA-Z0-9-_]/g;

export const UploadFilesModal = forwardRef((props: { parentId:number, projectId:number, files?: FileList }, ref: React.Ref<HTMLDialogElement>) => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [warning, setWarning] = useState<JSX.Element[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<NestedFile[]>([]);

    useEffect(() => {
        if(!store.project.activeProject) {
            throw new Error('No active project');
        }
        if (props.files) {
            checkAndUpdateFiles(props.files, props.projectId);
        }
    }, []);

    async function onFilesSelect(event: React.ChangeEvent<HTMLInputElement>) {
        if(!store.project.activeProject) {
            throw new Error('No active project');
        }
        await checkAndUpdateFiles(event.target.files, props.projectId);
    }

    async function checkAndUpdateFiles(files: FileList | null, projectId: number){
        if (!files || files.length === 0) return;

        // rename files to only supported characters (remove rest)
        const filteredFiles = 
            await Promise.all(
                Array.from(files)
                    .filter(file => file.name.includes('.'))
                    .map(async file => {
            const parts = file.name.split('.');
            let fileName = parts.slice(0, -1).join('_');
            let ext = parts.pop();
            fileName = fileName.replace(/\s/g, '_');
            fileName = fileName.replace(UNSUPPORTED_CHARACTERS, '');
            ext = ext?.replace(UNSUPPORTED_CHARACTERS, '');
            return {
                name: `${fileName}.${ext}`,
                content: getFileContent(file),
            };
        }));

        let warningMessages = [];

        // check if files already exist in the project
        for(const file of filteredFiles) {
            const existingFile = await db.fileExists(
                projectId,
                file.name,
                props.parentId,
            );
            if (existingFile) {
                warningMessages.push((<p key={`exists-${file.name}`}>File <strong>{file.name}</strong> already exists in the project and <strong>will be overwritten!</strong></p>));
            }
        }

        if(filteredFiles.length !== files.length) {
            warningMessages.push((<p key="unsupported">Some selected files were not supported and have been removed.</p>));
        }

        setSelectedFiles(filteredFiles);
        if (filteredFiles.some(file => !SUPPORTED_FILE_EXT.includes(file.name.split('.').pop()!))) {
            warningMessages.push((<p key="unsupported-types">Some selected files are not supported. They can be uploaded but might not work as expected.<br />Supported filetypes are: {SUPPORTED_FILE_EXT.join(', ')}</p>));
        }

        setWarning(warningMessages);
    }

    async function onSubmit(): Promise<any | undefined> {
        try{
            if (!store.project.activeProject) {
                throw new Error('No active project');
            }

            if (selectedFiles.length === 0) {
                throw new Error('No files selected');
            }

            for (const file of selectedFiles) {
                const content = Array.isArray(file.content) ? undefined : await file.content;
                await store.project.createOrUpdateFile(file.name, props.projectId, content, props.parentId);
            }
            return true;
        }
        catch(error){
            setError(String(error));
            return undefined;
        }
    }

    return (
        <Modal ref={ref} title="Upload Files" submitName="upload" onSubmit={onSubmit} error={error}>
            <>
                {!props.files && (<>
                    <label className="label cursor-pointer" htmlFor="files">Select Files</label>
                    <input
                        className="file-input file-input-lg w-full"
                        type="file"
                        multiple
                        onChange={onFilesSelect}
                    />
                </>)}

                {selectedFiles.length > 0 && (
                    <div className="mt-4">
                        <strong>Selected Files:</strong>
                        <ul className="list-disc list-inside">
                            {Array.from(selectedFiles).map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {warning.length > 0 && (
                    <div className="mt-4 alert alert-warning">
                        <div>{warning}</div>
                    </div>
                )}
            </>
        </Modal>
    );
});

async function getFileContent(file: globalThis.File): Promise<string | Blob> {
    if(file.type.includes('text')) {
        return await file.text();
    }
    else{
        return new Blob([await file.arrayBuffer()]);
    }
}