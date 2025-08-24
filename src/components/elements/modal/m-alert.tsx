import { forwardRef } from 'react';
import { Modal } from '@elements/modal';

export const AlertModal = forwardRef((props: { title: string, message: string, type: 'info' | 'warning' | 'error' }, ref: React.Ref<HTMLDialogElement>) => {
    async function onSubmit(): Promise<any | undefined>{
        return true;
    }

    return (
        <Modal ref={ref} title={props.title} submitName="OK" onSubmit={onSubmit}>
            <div className={`alert alert-${props.type}`}>{props.message}</div>
        </Modal>
    );
});