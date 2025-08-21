import { useState, forwardRef } from 'react';
import { Modal } from '@elements/modal';
import { Project, File } from '@store';
import db from '@localdb';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Input, Checkbox } from 'react-daisyui';

export const DownloadProjectModal = forwardRef((props: { project: Project }, ref: React.Ref<HTMLDialogElement>) => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [name, setName] = useState(`${props.project.name}.zip`);
    const [globals, setGlobals] = useState(false);

    async function onSubmit(): Promise<any | undefined>{
        try{
            const zipFile = await createZipFile(props.project, globals);
            saveAs(zipFile, name);
            return true;
        }
        catch(error){
            setError(String(error));
        }
        return undefined;
    }

    function onCheckGlobals(){
        setGlobals(!globals);
    }

    return (
        <Modal ref={ref} title={`Download '${props.project.name}'`} submitName="download" onSubmit={onSubmit} error={error}>
            <>
                <label className="label cursor-pointer" htmlFor="name">Name</label>
                <Input className="w-full" size="lg" value={name} onChange={(e) => setName(e.target.value)} />
                
                <label className="label cursor-pointer mt-8 justify-start">
                    <Checkbox checked={globals} onChange={onCheckGlobals}/>
                    Include globals
                </label>
            </>
        </Modal>
    );
});


async function createZipFile(project: Project, globals: boolean){
    const zip = new JSZip();

    function addFile(file: File, path: string = ''){
        if(file.name.includes('.')){
            zip.file(`${path}/`+file.path, file.content || '');
        }
        else{
            const folder = zip.folder(`${path}/`+file.path);
            if(!folder){
                throw Error(`zip error creating folder '${path}/${file.path}'`);
            }
        }
    }

    const projectFiles = await db.getProjectFiles(project.id);
    for (const file of projectFiles) {
        addFile(file, 'project');
    }
    if (globals) {
        const globalFiles = await db.getProjectFiles(0);
        for (const file of globalFiles) {
            addFile(file, 'global');
        }
    }
    zip.file('settings.json', JSON.stringify(project));
    return await zip.generateAsync({ type: 'blob' });
}