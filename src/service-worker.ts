import { registerRoute } from 'workbox-routing';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { Project } from '@store';
import db from '@localdb';

declare var self: ServiceWorkerGlobalScope;
declare var PRODUCTION: boolean;

let project: Project | null = null;

onmessage = m => {
    if (m.data.type === 'setProject') {
        project = m.data.project;
    }
};

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});


registerRoute(
    ({ url }) => url.origin === location.origin && /^\/(global|project|[0-9]+)\//.test(url.pathname),
    userFile
);

if (PRODUCTION) {
    cleanupOutdatedCaches();

    precacheAndRoute(self.__WB_MANIFEST, {
        cleanURLs: false,
    });

    registerRoute(
        ({ url }) => url.origin !== location.origin,
        new StaleWhileRevalidate({
            cacheName: 'cors-cache',
            plugins: [
                new ExpirationPlugin({
                    // keep for 1 month
                    maxAgeSeconds: 30 * 7 * 24 * 60 * 60,
                }),
            ],
        }),
    );
}
else {
    // console.log(self.__WB_MANIFEST);
}

async function userFile({url, request}: {url: URL, request: Request}): Promise<Response> {
    let response: Response;
    const header = {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/javascript' }
    };

    try {
        const path = url.pathname.split('/');
        let projectId;
        switch (path[1]) {
            case 'project': {
                if (!project)
                    throw Error('no project loaded');
                projectId = project.id; break;
            }
            case 'global': projectId = 0; break;
            default: projectId = Number(path[1]);
        }
        let file;
        if(path[2] === 'first'){
            file = await db.loadFirstFileByName(projectId, path[path.length-1]);
        }
        else{
            const filepath = path.slice(2).join('/');
            file = await db.loadFileByName(projectId, filepath);
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
            console.error(`invalid request`);
            response = await fetch(url.toString());
        }
    }
    return response;
}