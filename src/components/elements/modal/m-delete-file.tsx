import { useState, forwardRef } from 'react';
import { Modal } from '@elements/modal';
import store from '@store';
import { Alert } from 'react-daisyui';

export const DeleteFileModal = forwardRef((props: { id:number, name: string }, ref: React.Ref<HTMLDialogElement>) => {
    const [error, setError] = useState<string | undefined>(undefined);

    async function onSubmit(): Promise<any | undefined>{
        try{
            if(props.name.includes('.')) {
                await store.project.deleteFile(props.id);
            }
            else{
                await store.project.deleteFolder(props.id);
            }
            return true;
        }
        catch(error){
            setError(String(error));
            return undefined;
        }
    }

    return (
        <Modal ref={ref} title={`Delete '${props.name}'`} submitName="delete" onSubmit={onSubmit} error={error}>
            <>
            {props.name.includes('.') 
                ? <p>Are you sure you want to <strong>permanently</strong> delete the file '<strong>{props.name}</strong>'?</p>
                : <p>Are you sure you want to <strong>permanently</strong> delete the folder '<strong>{props.name}</strong>' and <strong>all its contents</strong>?</p>
            }
                <Alert status="warning" className="mt-4"><span>This operation can <strong>not</strong> be undone!</span></Alert>
            </>
        </Modal>
    );
});