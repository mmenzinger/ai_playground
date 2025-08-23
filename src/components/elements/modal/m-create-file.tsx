import { useState, forwardRef, useRef, useEffect } from 'react';
import { Modal, useFocus } from '@elements/modal';
import store from '@store';

export const CreateFileModal = forwardRef((props: { parentId:number, }, ref: React.Ref<HTMLDialogElement>) => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [name, setName] = useState('my_file');
    const [ext, setExt] = useState('js');
    const focus = useFocus<HTMLInputElement>();

    async function onSubmit(): Promise<any | undefined>{
        try{
            if(name.length === 0)
                throw Error(`The file name can not be empty!`);
            await store.project.createFile(
                `${name}.${ext}`,
                store.project.activeProject?.id,
                '',
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
        <Modal ref={ref} title={`Create File`} submitName="create" onSubmit={onSubmit} error={error}>
            <label className="label cursor-pointer" htmlFor="name">Name</label>
            <div className="flex items-center join">
                <input className="input input-lg join-item w-full" id="name" type="text" onChange={handleChange} value={name} ref={focus}/>
                <select className="select select-lg join-item w-24" onChange={(e) => setExt(e.target.value)}>
                    <option value="js" selected>.js</option>
                    <option value="json">.json</option>
                    <option value="md">.md</option>
                    <option value="pl">.pl</option>
                </select>
            </div>
        </Modal>
    );
});