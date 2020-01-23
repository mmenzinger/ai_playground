import {registerRoute} from 'workbox-routing/registerRoute';
import db from 'src/localdb';

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
        let id = 0; // default to global
        let filename = path[2];
        if(path[1] === 'project'){
            const state = await db.getState();
            id = state.projects.currentProject;
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