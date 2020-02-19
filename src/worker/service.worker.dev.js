import {registerRoute} from 'workbox-routing/registerRoute.mjs';
import db from 'src/localdb.js';

let project = 0;

onmessage = m => {
    if(m.data.type === 'setProject'){
        project = m.data.project;
        m.ports[0].postMessage({ project });
    }
};

registerRoute(
    /\/(global|project|[0-9]+)\//,
    userFile
);

async function userFile(arg){
    try{
        const init = {
            status: 200,
            statusText: 'OK',
            headers: {'Content-Type': 'application/javascript'}
        };
        const path = arg.url.pathname.split('/');
        let id = 0;
        let filename = path[2];
        if(path[1] === 'project'){
            id = project;
        }
        else if( ! isNaN(path[1])){ // if is number
            id = Number(path[1])
        }
        const file = await db.loadFileByName(id, filename);
        return new Response(file.content, init);
    }
    catch(error){
        console.log(`could not load user file '${arg.url.pathname}'`, error);
        return fetch(arg.request);
    }
}