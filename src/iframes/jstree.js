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

onload = () => {
    $('#jstree').jstree({
        plugins: [ 'contextmenu' ],
        contextmenu: {
            items: (node) => {
                return {
                    create: {
                        label: 'create file',
                        action: (obj) => {
                            let parent = node.parent;
                            if(parent === '#')
                                parent = node.id;
                            if(parent === 'global' && onAddFileGlobal)
                                onAddFileGlobal();
                            else if(parent === 'project' && onAddFileProject)
                                onAddFileProject();
                        },
                    },
                    delete: {
                        label: 'delete file',
                        action: (obj) => {
                            if(node.parent === 'global' || node.parent === 'project' && onDelete)
                                onDelete(node.data);
                        },
                    }
                }
            },
        }
    });
    jstree.resolve($('#jstree').jstree(true));
    $('#jstree').on('select_node.jstree', (e, data) => {
        if(data.node.children.length > 0 || data.node.parent === '#'){
            data.instance.deselect_node(data.node); 
        }
        else if(onFile)
            onFile(data.node.data);
    });
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
                state: {
                    selected: currentFile && currentFile.id === file.id,
                },
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
                state: {
                    selected: currentFile && currentFile.id === file.id,
                },
                data: file,
            }
        }),
    ];
    const tree = await jstree;
    tree.settings.core.data = data;
    tree.refresh();
}

function dispatchMouseEvent(event){
    parent.dispatchEvent(new MouseEvent(event.type, event));
}

onmousedown = dispatchMouseEvent;
onmouseenter = dispatchMouseEvent;
onmousemove = dispatchMouseEvent;
onmouseup = dispatchMouseEvent;
onmouseover = dispatchMouseEvent;
