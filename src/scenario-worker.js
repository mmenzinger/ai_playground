self.project = (filename) => {
    const projectId = location.hash.split('/')[1];
    return `local/${projectId}/${filename}`;
}

self.global = (filename) => {
    return `local/0/${filename}`;
}

/*const __console = console;
self.console = {
    log(str){
        __console.log(str);
    }
}*/

onmessage = m => {
    if(m.data.type === 'start'){
        try{
            importScripts(...m.data.files);
        }
        catch(e){
            console.warn("importScripts Error:", e);
        }
        
        console.log("files loaded", m.data.files);
        init(m.data.state);
        m.ports[0].postMessage({type: 'init_return'});
    }
    else if(m.data.type === 'update'){
        console.log("update", m.data.state);
        const action = update(m.data.state);
        console.log(m);
        m.ports[0].postMessage({type: 'update_return', action});
    }
}