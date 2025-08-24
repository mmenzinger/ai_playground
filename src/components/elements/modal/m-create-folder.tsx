import { useState, forwardRef } from 'react';
import { Modal, useFocus } from '@elements/modal';
import store from '@store';

export const CreateFolderModal = forwardRef((props: { parentId:number, projectId:number }, ref: React.Ref<HTMLDialogElement>) => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [name, setName] = useState('my_folder');
    const focus = useFocus<HTMLInputElement>();

    async function onSubmit(): Promise<any | undefined>{
        try{
            if(name.length === 0)
                throw Error(`The folder name can not be empty!`);
            await store.project.createFile(
                name,
                props.projectId,
                undefined,
                props.parentId,
            );
            return true;
        }
        catch(error){
            setError(String(error));
            return undefined;
        }
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const allowedCharacters = /^[a-zA-Z0-9_-]*$/;
        const name = event.target.value.trim();

        if (allowedCharacters.test(name)) {
            setName(name);
        }
    }

    return (
        <Modal ref={ref} title={`Create Folder`} submitName="create" onSubmit={onSubmit} error={error}>
            <label className="label cursor-pointer" htmlFor="name">Name</label>
            <div className="flex items-center">
                <input className="input input-lg w-full" id="name" type="text" onChange={handleChange} value={name} ref={focus}/>
            </div>
        </Modal>
    );
});