import { useRef, useState, createElement, ForwardRefExoticComponent, useImperativeHandle, forwardRef, useEffect } from "react";
import { NewProjectModal } from "./m-new-project";
import { DeleteProjectModal } from "./m-delete-project";
import { Defer } from "@src/utils";
import { DownloadProjectModal } from ".";

export const MODAL = Object.freeze({
    NEW_PROJECT: 'newProject',
    DELETE_PROJECT: 'deleteProject',
    DOWNLOAD_PROJECT: 'downloadProject',
});

const modalElements: {[key:string]:ForwardRefExoticComponent<any>} = {};
modalElements[MODAL.NEW_PROJECT] = NewProjectModal;
modalElements[MODAL.DELETE_PROJECT] = DeleteProjectModal;
modalElements[MODAL.DOWNLOAD_PROJECT] = DownloadProjectModal;

export type ModalHandlerFunctions = {
    openModal(name: string, props?: any): Promise<any>,
    resolveModal(value: any): void,
    rejectModal(error: Error): void,
}



export const ModalHandler = forwardRef((_, ref) => {
    const container: React.MutableRefObject<HTMLDivElement | null> = useRef(null);
    const [modals, setModals] = useState<JSX.Element[]>([]);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const returnValues = useRef<Defer<any>[]>([]);

    useEffect(() => {
        if(modals.length){
            // @ts-ignore it states ref does not exist, but it works...
            modals[modals.length-1].ref?.current?.showModal();
        }
    }, [modals]);

    const openModal = (name: string, props?: any): Promise<any> => {
        const modal = modalElements[name];
        if (modal){
            setModals(prevModals => {
                const element = createElement(modal, {key: prevModals.length, ref: dialogRef, ...props});
                return [...prevModals, element]
            });
            const defer = new Defer();
            returnValues.current.push(defer);
            return defer.promise;
        }
        else{
            console.error(`Modal ${name} not found`);
            throw Error(`Modal ${name} not found`);
        }
    }

    function closeModal() {
        setModals(prevModals => {
            return prevModals.slice(0, prevModals.length-1);
        });
    }

    function resolveModal(value: any): void{
        closeModal();
        const defer = returnValues.current.pop();
        defer?.resolve(value);
    }
    function rejectModal(error: Error): void{
        closeModal();
        const defer = returnValues.current.pop();
        defer?.reject(error);
    }

    useImperativeHandle(ref, () => ({
        openModal,
        resolveModal,
        rejectModal,
    } as ModalHandlerFunctions));

    return (
        <div ref={container}>{modals}</div>
    );
});
export default ModalHandler;