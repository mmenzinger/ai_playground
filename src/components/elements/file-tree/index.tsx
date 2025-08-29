import { useState, useEffect, JSX } from 'react';
import store, { File, Project } from '@store';
import { autorun } from 'mobx';
import { ModalAbort } from '@elements/modal';
import { MODAL } from '@elements/modal/modal-handler';


type TreeItem = {
    id: number | string;
    name: string;
    children: TreeItem[];
    projectId: number;
    parent?: TreeItem;
    file?: File;
};

function isFolder(fileName: string): boolean {
    return !fileName.includes('.');
}

function isChild(parent: TreeItem, testChild: TreeItem): boolean {
    if(testChild.parent?.id === parent.id)
        return true;
    for(const child of parent.children){
        if(isChild(child, testChild))
            return true;
    }
    return false;
}


// Function to get the appropriate icon for a file or folder
function getFileIcon(name: string, error: boolean = false): string {
    if(error){
        return '/assets/filetree/error.svg';
    }

    const parts = name.split('.');
    if (parts.length === 1) {
        return '/assets/filetree/folder.svg';
    }

    const extension = parts[parts.length - 1].toLowerCase();
    const supportedExtensions = ['jpg', 'js', 'json', 'md', 'pl', 'png', 'html'];
    
    if (supportedExtensions.includes(extension)) {
        return `/assets/filetree/${extension}.svg`;
    }
    
    return '/assets/filetree/unknown.svg';
}

function sortTreeItems(items: TreeItem[]): TreeItem[] {
    return items.sort((a, b) => {
        const aIsFolder = isFolder(a.name);
        const bIsFolder = isFolder(b.name);
        
        // Folders before files
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        
        // Alphabetical within same type
        return a.name.localeCompare(b.name);
    });
}

function filesToFileTree(files: File[], projectId: number): TreeItem {
    const global: TreeItem = {
        id: 'global',
        name: 'global',
        projectId: 0,
        children: [],
    };
    const project: TreeItem = {
        id: 'project',
        name: 'project',
        projectId: projectId,
        children: [],
    };
    const root: TreeItem = {
        id: 'root',
        name: 'root',
        projectId: 0,
        children: [global, project],
    };

    const getParent = (id: number, node: TreeItem): TreeItem | undefined => {
        if(node.id === id)
            return node;
        for(const child of node.children){
            const result = getParent(id, child);
            if(result)
                return result;
        }
        return undefined;
    }
    const pending = new Map<number, TreeItem[]>();
    for (const file of files) {
        let parent = getParent(file.parentId, root);
        if(file.parentId === 0){
            if(file.projectId === 0){
                parent = global;
            } else {
                parent = project;
            }
        }
        if(!parent){
            exit:
            for(const children of pending.values()){
                for(const item of children){
                    if(item.id === file.parentId){
                        parent = item;
                        break exit;
                    }
                }
            }
        }
        const children = pending.get(file.id) || [];
        const newItem = {
            id: file.id,
            name: file.name,
            children: children,
            parent: parent,
            projectId: parent?.projectId || 0,
            file: file,
        };
        for(const child of children){
            child.projectId = newItem.projectId;
        }
        if(children.length > 0){
            pending.delete(file.id);
            for(const child of children){
                child.parent = newItem;
            }
        }
        if(parent){
            parent.children.push(newItem);
        }
        else{
            pending.set(file.parentId, [
                ...(pending.get(file.parentId) || []),
                newItem
            ]);
        }
    }

    return root;
}

interface FileTreeProps {
    project: Project;
}

//#############################################################################
// FileTree Component
//#############################################################################
function FileTree(props: FileTreeProps): JSX.Element {
    const [files, setFiles] = useState<File[]>([]);
    const [hasIndexHtml, setHasIndexHtml] = useState<boolean>(false);
    const [draggedOverNode, setDraggedOverNode] = useState<number | string | null>(null);
    const [draggedItem, setDraggedItem] = useState<TreeItem | null>(null);
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        item: TreeItem | null;
    }>({ visible: false, x: 0, y: 0, item: null });
    
    useEffect(() => {
        const disposer = autorun(async () => {
            store.project.lastFileTreeChange;
            const [projectFiles, globalFiles] = await Promise.all([
                store.project.getProjectFiles(props.project.id),
                store.project.getProjectFiles(0),
            ]);
            setFiles([...projectFiles, ...globalFiles]);
            setHasIndexHtml(projectFiles.some(file => file.name === 'index.html'));
        });
        return () => {
            disposer();
        };
    }, []);

    // Close context menu when clicking elsewhere
    useEffect(() => {
        const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
        if (contextMenu.visible) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
        return;
    }, [contextMenu.visible]);

    const selectHandler = (item: TreeItem) => {
        if (item.file && !isFolder(item.file.name)) {
            store.project.openFile(item.file.id);
        }
    };

    const contextMenuHandler = (event: React.MouseEvent, item: TreeItem) => {
        event.preventDefault();
        event.stopPropagation();
        
        setContextMenu({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            item: item
        });
    };

    const handleDelete = async () => {
        if (contextMenu.item) {
            try {
                const file = contextMenu.item.file;
                if(!file?.id || !file?.name)
                {
                    throw Error(`Invalid file for deletion ${JSON.stringify(file)}`);
                }
                await store.app.openModal(MODAL.DELETE_FILE, { id: file.id, name: file.name });
            } catch (error) {
                if (!(error instanceof ModalAbort)){
                    console.error(error);
                }
            }
        }
        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    const handleRename = async () => {
        if (contextMenu.item) {
            const file = contextMenu.item.file;
            if(!file?.id || !file?.name)
            {
                throw Error(`Invalid file for rename ${JSON.stringify(file)}`);
            }
            await store.app.openModal(MODAL.RENAME_FILE, { id: file.id, name: file.name });
        }
        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    const handleCreateFile = async () => {
        if (contextMenu.item) {
            const file = contextMenu.item.file;
            let parentId = 0;
            let projectId = 0;
            if(file){
                parentId = isFolder(file.name) ? file.id : file.parentId;
                projectId = file.projectId;
            }
            else{
                if(contextMenu.item.id === 'project'){
                    projectId = props.project.id;
                }
            }
            await store.app.openModal(MODAL.CREATE_FILE, { parentId, projectId });
        }
        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    const handleCreateFolder = async () => {
        if (contextMenu.item) {
            const file = contextMenu.item.file;
            let parentId = 0;
            let projectId = 0;
            if(file){
                parentId = isFolder(file.name) ? file.id : file.parentId;
                projectId = file.projectId;
            }
            else{
                if(contextMenu.item.id === 'project'){
                    projectId = props.project.id;
                }
            }
            await store.app.openModal(MODAL.CREATE_FOLDER, { parentId, projectId });
        }
        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    const handleUploadFiles = async () => {
        if (contextMenu.item) {
            const file = contextMenu.item.file;
            if(!file){
                throw Error(`Invalid parent item ${JSON.stringify(contextMenu.item)}`);
            }
            const parentId = isFolder(file.name) ? file.id : file.parentId;
            await store.app.openModal(MODAL.UPLOAD_FILES, { parentId });
        }
        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    const handleCreateIndexHtml = async () => {
        console.log('Create index.html');
        const content = await fetch('/simulator/default.html').then(res => res.text());
        await store.project.createFile('index.html', props.project.id, content, 0);
        setContextMenu(prev => ({ ...prev, visible: false }));
    }

    const handleDrop = async (event: React.DragEvent<HTMLDetailsElement>, node: TreeItem) => {
        event.preventDefault();
        event.stopPropagation();
        setDraggedOverNode(null);

        let parentId = Number(node.id);
        let projectId = node.projectId;
        if(isNaN(parentId)){
            parentId = 0;
        }
        
        // upload dropped files
        const files = event.dataTransfer.files;
        if (files && files.length > 0) {
            await store.app.openModal(MODAL.UPLOAD_FILES, { projectId, parentId, files });
        }
        // move tree items
        else if (draggedItem) {
            if(draggedItem.parent?.id !== node.id 
            && draggedItem.id !== node.id
            && !isChild(draggedItem, node)
            && draggedItem.file) {

                try{
                    await store.project.moveFile(draggedItem.file.id, parentId, projectId);
                } catch (error) {
                    let msg = String(error);
                    if(msg.includes('uniqueness requirements')){
                        msg = `A file with the same name already exists in folder '${node.name}'.`;
                    }
                    store.app.openModal(MODAL.ALERT, { title: 'Error moving file', message: msg, type: 'error' });
                }
            }
            setDraggedItem(null);
        }
    };

    const handleDragStart = (event: React.DragEvent<HTMLAnchorElement | HTMLDetailsElement | HTMLLIElement>, node: TreeItem) => {
        // console.log('Drag start:', node);
        event.stopPropagation();

        // create custom ghost to prevent bleeding
        const ghost = document.createElement('div');
        ghost.classList.add('alert', 'size-fit', 'px-2', 'py-0');
        ghost.innerHTML = `
            <img src="${getFileIcon(node.name)}" class="w-3 h-4" />
            <span>${node.name}</span>
        `;
        document.body.appendChild(ghost);
        event.dataTransfer.setDragImage(ghost, 10, 10);
        event.dataTransfer.effectAllowed = 'move';
        setTimeout(() => document.body.removeChild(ghost), 0);

        setDraggedItem(node);
    };

    const handleDragEnd = (event: React.DragEvent<HTMLDetailsElement>) => {
        // console.log('Drag end:', node);
        event.stopPropagation();
        setDraggedItem(null);
        setDraggedOverNode(null);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDetailsElement>, node: TreeItem) => {
        // without preventDefault, the browser will open the files!
        event.preventDefault();
        event.stopPropagation();
        setDraggedOverNode(node.id);
    };

    const handleDragEnter = (event: React.DragEvent<HTMLAnchorElement | HTMLDetailsElement>, node: TreeItem) => {
        event.preventDefault();
        event.stopPropagation();
        setDraggedOverNode(node.id);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLAnchorElement | HTMLDetailsElement>) => {
        event.preventDefault();
        event.stopPropagation();

        // to prevent flickering, only clear if we're actually leaving the element
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX;
        const y = event.clientY;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDraggedOverNode(null);
        }
    };
    
    const createFileTreeItems = (node: TreeItem): JSX.Element => {
        const children = sortTreeItems(node.children).map(child => createFileTreeItems(child));
        const isBeingDraggedOver = draggedOverNode === node.id;
        
        return (<li key={node.id} draggable={true} onDragStart={(e) => handleDragStart(e, node)}>
            {isFolder(node.name) ? (
                <details open={true}
                    onDrop={(e) => handleDrop(e, node)}
                    onDragOver={(e) => handleDragOver(e, node)}
                    onDragEnter={(e) => handleDragEnter(e, node)}
                    onDragLeave={(e) => handleDragLeave(e)}
                    onDragEnd={(e) => handleDragEnd(e)}
                    className={isBeingDraggedOver ? 'bg-blue-200 dark:bg-blue-800 rounded' : ''}
                    onContextMenu={(e) => {
                        if(e.target instanceof HTMLElement && e.target.tagName === 'SUMMARY')
                        contextMenuHandler(e, node)
                    }}
                >
                    <summary>
                        <img src={getFileIcon(node.name)} alt="file icon" className="w-4 h-4" />
                        {node.name}
                    </summary>
                    <ul>
                        {children}
                    </ul>
                </details>
            ) : (
                <a 
                    onClick={() => selectHandler(node)}
                    onContextMenu={(event) => contextMenuHandler(event, node)}
                >
                    <img src={getFileIcon(node.name, store.project.fileErrors.has(node.file?.id || 0))} alt="file icon" className="w-3 h-4" />
                    {node.name}
                </a>
                
            )}
        </li>);
    }

    const rootNode = filesToFileTree(files, props.project.id);
    return (<>
        <ul 
            className="menu menu-md w-full h-full flex-nowrap overflow-auto"
        >
            {createFileTreeItems(rootNode.children[0])}
            {createFileTreeItems(rootNode.children[1])}
        </ul>
        
        {contextMenu.visible && (
                <ul
                    className="menu fixed bg-base-100 border border-base-300 shadow-lg rounded z-50 w-48"
                    style={{
                        left: contextMenu.x,
                        top: contextMenu.y,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    { contextMenu.item?.name && <>
                        <li className="menu-title">
                            {contextMenu.item?.name}
                        </li>
                        <div className="divider m-0"></div>
                    </>}

                    <li>
                        <a onClick={handleCreateFile}>
                            New File
                        </a>
                    </li>
                    <li>
                        <a onClick={handleCreateFolder}>
                            New Folder
                        </a>
                    </li>
                    <li>
                        <a onClick={handleUploadFiles}>
                            Upload Files
                        </a>
                    </li>
                    <li>
                        <a onClick={handleRename}>
                            Rename
                        </a>
                    </li>
                    <li>
                        <a onClick={handleDelete} className="text-error">
                            Delete
                        </a>
                    </li>
                    { !hasIndexHtml ? <>
                        <div className="divider m-0"></div>
                        <li>
                            <a onClick={handleCreateIndexHtml}>
                                Create index.html
                            </a>
                        </li>
                    </> : <></> }
                    
                </ul>
            )}
    </>);
}

export default FileTree;
