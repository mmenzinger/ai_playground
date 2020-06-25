import { registerRoute, RouteHandlerCallbackContext } from 'workbox-routing';
import { precacheAndRoute } from 'workbox-precaching';
import { CacheFirst } from 'workbox-strategies';
import { Project } from '@store/types';
import db from '@localdb';

declare var PRODUCTION: boolean;

let project: Project | null = null;

onmessage = m => {
    if(m.data.type === 'setProject'){
        project = m.data.project;
        m.ports[0].postMessage({ project });
    }
};

(self as ServiceWorkerGlobalScope).addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});
(self as ServiceWorkerGlobalScope).addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});


registerRoute(
    /\/(global|project|[0-9]+)\//,
    userFile
);

if(PRODUCTION){
    precacheAndRoute(self.__WB_MANIFEST);

    registerRoute(
        /\.(js|html)$/,
        new CacheFirst({
            cacheName: 'script-cache',
            plugins: [],
        }),
    );
    
    registerRoute(
        /\.(svg|png)$/,
        new CacheFirst({
            cacheName: 'image-cache',
            plugins: [],
        }),
    );
}
else{
    // console.log(self.__WB_MANIFEST);
}

async function userFile(arg: RouteHandlerCallbackContext): Promise<Response>{
    let response: Response;
    try{
        const init = {
            status: 200,
            statusText: 'OK',
            headers: {'Content-Type': 'application/javascript'}
        };
        const path = arg.url.pathname.split('/');
        let id;
        switch(path[1]){
            case 'project': {
                if(!project)
                    throw Error('no project loaded');
                id = project.id; break;
            }
            case 'global': id = 0; break;
            default: id = Number(path[1]);
        }

        let filename = path[path.length-1];
        const file = await db.loadFileByName(id, filename);
        if(! (file.content instanceof Blob) && file.name.endsWith('.js')){
            file.content = file.content?.replace(/(from\s*['"`])(project|global|scenario|lib)\//g, '$1/$2/');
        }
        else if(file.name.endsWith('.png')){
            init.headers = {'Content-Type': 'image/png'};
        }
        response = new Response(file.content, init);
    }
    catch(error){
        // if(!PRODUCTION){
        //     console.warn(`could not load user file '${arg.url.pathname}'`, error);
        // }
        if(arg.request){
            response = await fetch(arg.request);
        }
        else{
            console.error(`invalid request`);
            response = await fetch(arg.url.toString());
        }
    }
    return response;
}