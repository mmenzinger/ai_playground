function defer(){
    let res, rej;
    const promise = new Promise((resolve, reject) => {
        res = resolve;
        rej = reject;
    });
    promise.resolve = function(val) {
        promise.resolved = true;
        promise.value = val;
        res(val);
    };
    promise.reject = function(error) {
        promise.resolved = true;
        promise.value = val;
        rej(error);
    }
    promise.resolved = false;
    promise.value = undefined;
    
    return promise;
}

let jstree = defer();

// get set by parent
var onFile = undefined;
var onAddFileGlobal = undefined;
var onAddFileProject = undefined;
var onDelete = undefined;

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

    let lastSelected = undefined;
    $('#jstree').on('select_node.jstree', (e, data) => {
        if(data.node.parent === '#'){
            data.instance.deselect_node(data.node);
            preventSelectNodeEvent = true;
            data.instance.select_node(lastSelected);
            preventSelectNodeEvent = false;
        }
        else{
            if(onFile && !preventSelectNodeEvent && lastSelected?.id !== data.node.id){
                onFile(data.node.data);
            }
            lastSelected = data.node;
        }
        
    });
}

function contextMenu(node){
    let create = undefined;
    let remove = undefined;
    
    let parent = node.parent;
    if(node.parent === '#')
        parent = node.id;
    if(parent === 'global' && onAddFileGlobal){
        create = {
            label: 'create global file',
            icon: '../assets/interface/add.svg',
            action: (obj) => onAddFileGlobal(),
        };
    }
    else if(parent === 'project' && onAddFileProject){
        create = {
            label: 'create project file',
            icon: '../assets/interface/add.svg',
            action: (obj) => onAddFileProject(),
        };
    }

    if(! ['global', 'project', 'index.js', 'scenario.md'].includes(node.text) && onDelete){
        let name = node.text;
        if(name.length > 10){
            name = name.substring(0,8) + '...';
        }
        remove = {
            label: `delete file '${name}'`,
            icon: '../assets/interface/trash.svg',
            action: (obj) => onDelete(node.data),
        }
    }
    
    return {
        create,
        remove,
    }
}

function getEnding(filename){
    const parts = filename.split('.');
    if(parts.length < 1)
        return 'unknown';
    return parts[parts.length-1];
}

async function updateFiles(global, project, currentFile){
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
            const ending = getEnding(file.name);
            return {
                id: file.id,
                parent: 'project',
                text: file.name,
                icon: `../assets/filetree/${ending}.svg`,
                data: file,
            }
        }),
        ...global.map(file => {
            const ending = getEnding(file.name);
            return {
                id: file.id,
                parent: 'global',
                text: file.name,
                icon: `../assets/filetree/${ending}.svg`,
                data: file,
            }
        }),
    ];
    const tree = await jstree;
    tree.settings.core.data = data;
    tree.refresh();
    jstree = defer();
    selectFile(currentFile);
}

async function selectFile(currentFile){
    if(currentFile){
        const tree = await jstree;
        preventSelectNodeEvent = true;
        tree.activate_node(currentFile.id);
        preventSelectNodeEvent = false;
    }
}