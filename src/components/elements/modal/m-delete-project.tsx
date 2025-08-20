import { useState, forwardRef } from 'react';
import { Modal } from '@elements/modal';
import store, { Project } from '@store';
import { Alert } from 'react-daisyui';

export const DeleteProjectModal = forwardRef((props: { project: Project }, ref: React.Ref<HTMLDialogElement>) => {
    const [error, setError] = useState<string | undefined>(undefined);

    async function onSubmit(): Promise<any | undefined>{
        try{
            await store.project.deleteProject(props.project.id);
            return true;
        }
        catch(error){
            setError(String(error));
        }
        return undefined;
    }

    return (
        <Modal ref={ref} title="Delete Project" submitName="delete" onSubmit={onSubmit} error={error}>
            <>
                <p>Are you sure you want to <strong>permanently</strong> delete the project '<strong>{props.project.name}</strong>'?</p>
                <Alert status="warning" className="mt-4"><span>This operation can <strong>not</strong> be undone!</span></Alert>
            </>
        </Modal>
    );
});