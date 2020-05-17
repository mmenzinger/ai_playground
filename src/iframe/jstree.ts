import { Defer } from '@util';
import { File, ProjectErrors } from '@store/types';

declare var window: JSTreeWindow;

type Node = {
    id: string,
    parent: string,
    text: string,
    data: File,
}

type NodeData = {
    node: Node,
    instance: JSTree,
};



let jstree = new Defer<JSTree>();

window.onFile = (_: File) => {};
window.onAddFileGlobal = () => {};
window.onAddFileProject = () => {};
window.onDelete = async (_: File) => {};

let preventSelectNodeEvent = false;

onload = () => {
    $('#jstree').jstree({
        plugins: [ 'contextmenu' ],
        contextmenu: {
            items: contextMenu,
            show_at_node: true,
        },
        'core': {
            'multiple': false,
        }
    });
    jstree.resolve($('#jstree').jstree(true));

    $('#jstree').on('refresh.jstree', () => {
        jstree.resolve($('#jstree').jstree(true));
    });

    let lastSelected: Node | undefined = undefined;
    $('#jstree').on('select_node.jstree', (_, data: NodeData) => {
        if(data.node.parent === '#'){
            data.instance.deselect_node(data.node);
            preventSelectNodeEvent = true;
            data.instance.select_node(lastSelected);
            preventSelectNodeEvent = false;
        }
        else{
            if(window.onFile && !preventSelectNodeEvent && lastSelected?.id !== data.node.id){
                window.onFile(data.node.data);
            }
            lastSelected = data.node;
        }
        
    });
}

function contextMenu(node: Node){
    let create = undefined;
    let remove = undefined;
    
    let parent = node.parent;
    if(node.parent === '#')
        parent = node.id;
    if(parent === 'global'){
        create = {
            label: 'create global file',
            icon: '../assets/interface/add.svg',
            action: () => window.onAddFileGlobal(),
        };
    }
    else if(parent === 'project'){
        create = {
            label: 'create project file',
            icon: '../assets/interface/add.svg',
            action: () => window.onAddFileProject(),
        };
    }

    if(! ['global', 'project', 'index.js', 'scenario.md'].includes(node.text)){
        let name = node.text;
        if(name.length > 10){
            name = name.substring(0,8) + '...';
        }
        remove = {
            label: `delete file '${name}'`,
            icon: '../assets/interface/trash.svg',
            action: () => window.onDelete(node.data),
        }
    }
    
    return {
        create,
        remove,
    }
}

function getEnding(fileName: string){
    const parts = fileName.split('.');
    if(parts.length < 1)
        return 'unknown';
    return parts[parts.length-1];
}

window.updateFiles = async function(global: File[], project: File[], activeFile: File, errors: ProjectErrors = []){
    const data = [
        {
            id: 'global',
            parent: '#',
            text: 'global',
            state: {
               opened: true,
               selected: false
            }
        },
        {
            id: 'project',
            parent: '#',
            text: 'project',
            state: {
               opened: true,
               selected: false
            }
        },
        ...project.map(file => {
            let ending = getEnding(file.name);
            return {
                id: file.id,
                parent: 'project',
                text: file.name,
                icon: `../assets/filetree/${ending}.svg`,
                data: file,
            }
        }),
        ...global.map(file => {
            let ending = getEnding(file.name);
            return {
                id: file.id,
                parent: 'global',
                text: file.name,
                icon: `../assets/filetree/${ending}.svg`,
                data: file,
            }
        }),
    ];
    const tree = await jstree.promise;
    if(tree.settings)
        tree.settings.core.data = data;
    tree.refresh();
    jstree = new Defer<JSTree>();
    window.setErrors(errors);
    window.selectFile(activeFile);
}

window.selectFile = async function (file: File){
    if(file){
        const tree = await jstree.promise;
        preventSelectNodeEvent = true;
        tree.activate_node(file.id, undefined);
        preventSelectNodeEvent = false;
    }
}

const currentErrorNodes: {[fileId: string]: Node} = {};
window.setErrors = async function (errors: ProjectErrors){
    const tree = await jstree.promise;
    for(const fileId of Object.keys(errors)){
        const node = tree.get_node(fileId);
        if(node){
            tree.set_icon(node, `../assets/filetree/error.svg`);
            currentErrorNodes[fileId] = node;
        }
    }
    for(const node of Object.values(currentErrorNodes)){
        if(!errors[Number(node.id)]){
            const ending = getEnding(node.text);
            tree.set_icon(node, `../assets/filetree/${ending}.svg`);
            delete currentErrorNodes[node.id];
        }
    }
}


export type JSTreeWindow = Window & {
    onFile: (file: File) => void;
    onAddFileGlobal: () => void;
    onAddFileProject: () => void;
    onDelete: (file: File) => Promise<void>;

    updateFiles: (global: File[], project: File[], activeFile: File, errors: ProjectErrors) => Promise<void>;
    selectFile: (file: File) => Promise<void>;
    setErrors: (errors: ProjectErrors) => Promise<void>;
};