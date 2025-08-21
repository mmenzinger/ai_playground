import { useState, forwardRef } from 'react';
import { Modal } from '@elements/modal';
import store from '@store';
import { Input } from 'react-daisyui';

export const RenameFileModal = forwardRef((props: { id:number, name: string }, ref: React.Ref<HTMLDialogElement>) => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [newName, setNewName] = useState(props.name);

    async function onSubmit(): Promise<any | undefined>{
        try{
            if(newName.length === 0)
                throw Error(`The file name can not be empty!`);
            await store.project.renameFile(props.id, newName);
            return true;
        }
        catch(error){
            setError(String(error));
        }
        return undefined;
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const allowedCharacters = /^[a-zA-Z0-9_-]*$/;
        const newName = event.target.value.trim();

        if (allowedCharacters.test(newName)) {
            const ext = props.name.split('.').pop();
            setNewName(`${newName}.${ext}`);
        }
    }

    const parts = newName.split('.');
    const [name, ext] = parts.length > 1 ? parts : [parts[0], ''];
    return (
        <Modal ref={ref} title={`Rename ${props.name}`} submitName="rename" onSubmit={onSubmit} error={error}>
            <>
            {props.name.includes('.') 
                ? <>
                    <label className="label cursor-pointer" htmlFor="name">Name</label>
                    <div className="flex items-center"><Input className="w-full" size="lg" id="name" type="text" onChange={handleChange} value={name} /><strong>.{ext}</strong></div>
                </>
                : <>
                    <label className="label cursor-pointer" htmlFor="name">Name</label>
                    <Input className="w-full" size="lg" id="name" type="text" onChange={handleChange} value={name} />
                </>
            }
            </>
        </Modal>
    );
});