import {registerRoute} from 'workbox-routing/registerRoute.mjs';
import db from 'src/localdb';

registerRoute(
    /\/local\/[0-9]+\//,
    localFile
);
registerRoute(
    /\.js$/,
    test
);
async function test(arg){
    //console.log(arg);
    //console.log(db.loadState());
    return fetch(arg.request);
}

async function localFile(arg){
    try{
        const init = { 
            status: 200, 
            statusText: 'OK',
            headers: {'Content-Type': 'application/javascript'}
        };
        const path = arg.url.pathname.split('/');
        const file = await db.loadFileByName(Number(path[2]), path[3]);
        return new Response(file.content, init);
    }
    catch(error){
        console.warn(error);
        return fetch(arg.request);
    }
}