import { useState, useEffect, JSX } from 'react';
import store, { File, Project } from '@store';
import { autorun } from 'mobx';
import { Menu } from 'react-daisyui';
import { ModalAbort } from '@elements/modal';
import { MODAL } from '@elements/modal/modal-handler';


type TreeItem = {
    id: number | string;
    name: string;
    children: TreeItem[];
    file?: File;
};

function isFolder(fileName: string): boolean {
    return !fileName.includes('.');
}

// Function to get the appropriate icon for a file or folder
function getFileIcon(name: string): string {
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

function filesToFileTree(files: File[]): TreeItem {
    const global: TreeItem = {
        id: 'global',
        name: 'global',
        children: [],
    };

    const project: TreeItem = {
        id: 'project',
        name: 'project',
        children: [],
    };

    const root: TreeItem = {
        id: 'root',
        name: 'root',
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
        if(file.parentId !== 0){
            const parent = getParent(file.parentId, root);
            const children = pending.get(file.id) || [];
            if(children.length > 0){
                pending.delete(file.id);
            }
            if(parent){
                parent.children.push({
                    id: file.id,
                    name: file.name,
                    children: children,
                    file: file,
                });
            }
            else{
                pending.set(file.id, 
                    [
                        ...(pending.get(file.id) || []),
                        {
                            id: file.id,
                            name: file.name,
                            children: children,
                            file: file,
                        }
                    ]
                );
            }
        }
        else{
            const parent = file.projectId ? project : global;
            parent.children.push({
                id: file.id,
                name: file.name,
                children: [],
                file: file,
            });
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
        console.log('Selected item:', item);
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

    const handleCreateIndexHtml = async () => {
        console.log('Create index.html');
        const content = await fetch('/simulator/default.html').then(res => res.text());
        await store.project.createFile('index.html', props.project.id, content, 0);
        setContextMenu(prev => ({ ...prev, visible: false }));
    }
    
    const createFileTreeItems = (node: TreeItem): JSX.Element => {
        const children = sortTreeItems(node.children).map(child => createFileTreeItems(child));
        return (<Menu.Item key={node.id}>
            {children.length > 0 || isNaN(Number(node.id)) ? (
                <Menu.Details open={true} label={<>
                        <img src={getFileIcon(node.name)} alt="file icon" className="w-4 h-4" />
                        {node.name}
                    </>}
                    onContextMenu={(e) => {
                        if(e.target instanceof HTMLElement && e.target.tagName === 'SUMMARY')
                        contextMenuHandler(e, node)
                    }}
                >
                    {children}
                </Menu.Details>
            ) : (
                <a 
                    onClick={() => selectHandler(node)}
                    onContextMenu={(event) => contextMenuHandler(event, node)}
                >
                    <img src={getFileIcon(node.name)} alt="file icon" className="w-3 h-4" />
                    {node.name}
                </a>
                
            )}
        </Menu.Item>);
    }

    const rootNode = filesToFileTree(files);
    return (<>
        <Menu 
            className="w-full h-full"
            size="md"
        >
            {createFileTreeItems(rootNode.children[0])}
            {createFileTreeItems(rootNode.children[1])}
        </Menu>
        
        {contextMenu.visible && (
                <Menu
                    className="fixed bg-base-100 border border-base-300 shadow-lg rounded z-50 w-48"
                    style={{
                        left: contextMenu.x,
                        top: contextMenu.y,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    { !hasIndexHtml ? 
                        <Menu.Item>
                            <a onClick={handleCreateIndexHtml}>
                                Create index.html
                            </a>
                        </Menu.Item> 
                        : <></>
                    }
                    <Menu.Item>
                        <a onClick={handleRename}>
                            Rename
                        </a>
                    </Menu.Item>
                    <Menu.Item>
                        <a onClick={handleDelete} className="text-error">
                            Delete
                        </a>
                    </Menu.Item>
                </Menu>
            )}
    </>);
}

export default FileTree;
