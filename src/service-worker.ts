// import { registerRoute } from 'workbox-routing';
// import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
// import { StaleWhileRevalidate } from 'workbox-strategies';
// import { ExpirationPlugin } from 'workbox-expiration';
// import { Project } from '@store';
import db from '@localdb';
// import { isNumber } from 'lodash-es';

declare var self: ServiceWorkerGlobalScope;
// declare var PRODUCTION: boolean;

let clientProjectId: Map<string, number> = new Map();

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});


self.addEventListener('fetch', async (event) => {
    const { url } = event.request;
    const urlObj = new URL(url);
    if (urlObj.origin === location.origin && /^\/(global|project|[0-9]+)\//.test(urlObj.pathname)) {
        event.respondWith(userFile({ url: urlObj, request: event.request, clientId: event.clientId }));
    }
});

// registerRoute(
//     ({ url }) => url.origin === location.origin && /^\/(global|project|[0-9]+)\//.test(url.pathname),
//     userFile
// );

// if (PRODUCTION) {
//     cleanupOutdatedCaches();

//     precacheAndRoute(self.__WB_MANIFEST, {
//         cleanURLs: false,
//     });

//     registerRoute(
//         ({ url }) => url.origin !== location.origin,
//         new StaleWhileRevalidate({
//             cacheName: 'cors-cache',
//             plugins: [
//                 new ExpirationPlugin({
//                     // keep for 1 month
//                     maxAgeSeconds: 30 * 7 * 24 * 60 * 60,
//                 }),
//             ],
//         }),
//     );
// }
// else {
//     // console.log(self.__WB_MANIFEST);
// }

async function userFile({url, request, clientId}: {url: URL, request: Request, clientId: string}): Promise<Response> {
    let response: Response;
    const header = {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/javascript' }
    };

    try {
        const path = url.pathname.split('/');
        let projectId = clientProjectId.get(clientId);
        switch (path[1]) {
            case 'project': {
                const pid = Number(request.referrer.match(/pid=([0-9]+)/)?.[1]);
                if(pid){
                    clientProjectId.set(clientId, pid);
                    projectId = pid;
                }
                break;
            }
            case 'global': projectId = 0; break;
            default: projectId = Number(path[1]);
        }
        if (!projectId) {
            console.error('No project loaded for client:', clientId);
            return new Response('Error: No project loaded', {
                status: 400,
                statusText: 'Bad Request',
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        let file;
        if(path[2] === 'first'){
            file = await db.loadFirstFileByName(projectId, path[path.length-1]);
        }
        else if(path[2] === 'file' && Number(path[3])){
            const id = Number(path[3]);
            file = await db.loadFile(id);
        }
        else{
            const filepath = path.slice(2).join('/');
            file = await db.loadFileByPath(projectId, filepath);
        }
        
        if (!(file.content instanceof Blob) && file.name.endsWith('.js')) {
            file.content = file.content?.replace(/(from\s*['"`])(project|global|scenario|lib)\//g, '$1/$2/');
        }
        else if (file.name.endsWith('.png')) {
            header.headers = { 'Content-Type': 'image/png' };
        }
        response = new Response(file.content, header);
    }
    catch (error) {
        
        if (url.pathname.endsWith('localstorage.json')) {
            response = new Response('{}', header);
        }
        else if (request) {
            response = await fetch(request);
        }
        else {
            console.error(`Error fetching user file (${url.toString()}): ${error}`);
            response = await fetch(url.toString());
        }
    }
    return response;
}