import { useRef, useState, createElement, ForwardRefExoticComponent, useImperativeHandle, forwardRef, useEffect } from "react";
import { Defer } from "@src/utils";
import { 
    AlertModal,
    CreateFileModal,
    CreateFolderModal,
    CreateProjectModal,
    DeleteFileModal,
    DeleteProjectModal,
    DownloadProjectModal,
    RenameFileModal,
    UploadFilesModal,
    UploadProjectModal,
} from ".";

export const MODAL = Object.freeze({
    ALERT: 'alert',
    CREATE_FILE: 'createFile',
    CREATE_FOLDER: 'createFolder',
    CREATE_PROJECT: 'createProject',
    DELETE_FILE: 'deleteFile',
    DELETE_PROJECT: 'deleteProject',
    DOWNLOAD_PROJECT: 'downloadProject',
    RENAME_FILE: 'renameFile',
    UPLOAD_FILES: 'uploadFiles',
    UPLOAD_PROJECT: 'uploadProject',
});

const modalElements: {[key:string]:ForwardRefExoticComponent<any>} = {};
modalElements[MODAL.ALERT] = AlertModal;
modalElements[MODAL.CREATE_FILE] = CreateFileModal;
modalElements[MODAL.CREATE_FOLDER] = CreateFolderModal;
modalElements[MODAL.CREATE_PROJECT] = CreateProjectModal;
modalElements[MODAL.DELETE_FILE] = DeleteFileModal;
modalElements[MODAL.DELETE_PROJECT] = DeleteProjectModal;
modalElements[MODAL.DOWNLOAD_PROJECT] = DownloadProjectModal;
modalElements[MODAL.RENAME_FILE] = RenameFileModal;
modalElements[MODAL.UPLOAD_FILES] = UploadFilesModal;
modalElements[MODAL.UPLOAD_PROJECT] = UploadProjectModal;

export type ModalHandlerFunctions = {
    openModal(name: string, props?: any): Promise<any>,
    resolveModal(value: any): void,
    rejectModal(error: Error): void,
}

export const ModalHandler = forwardRef((_, ref) => {
    const container: React.RefObject<HTMLDivElement | null> = useRef(null);
    const [modal, setModal] = useState<React.ReactElement>();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const returnValues = useRef<Defer<any>[]>([]);

    useEffect(() => {
        if(modal){
            dialogRef.current?.showModal();
        }
    }, [modal]);

    const openModal = (name: string, props?: any): Promise<any> => {
        const modal = modalElements[name];
        if (modal){
            const element = createElement(modal, {key: 0, ref: dialogRef, ...props});
            setModal(element);
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
        setModal(undefined);
        dialogRef.current?.close();
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
        <div ref={container}>{modal}</div>
    );
});
export default ModalHandler;