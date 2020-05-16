import {registerRoute} from 'workbox-routing/registerRoute.mjs';
import {CacheFirst} from 'workbox-strategies/CacheFirst.mjs';
import {Plugin as ExpirationPlugin} from 'workbox-expiration/Plugin.mjs';
import db from '@localdb';
import { Project } from '@store/types';

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
    console.warn(' --- PRODUCTION ---')
    registerRoute(
        /\.(js|html)$/,
        new CacheFirst({
            cacheName: 'script-cache',
            plugins: [
                new ExpirationPlugin({
                    maxAgeSeconds: 60 * 60,
                }),
            ],
        }),
    );
    registerRoute(
        /\.(svg|png)$/,
        new CacheFirst({
            cacheName: 'image-cache',
            plugins: [
                new ExpirationPlugin({
                    maxAgeSeconds: 24 * 60 * 60,
                }),
            ],
        }),
    );
}

async function userFile(arg){
    try{
        if(!project)
            throw Error('no project loaded')

        const init = {
            status: 200,
            statusText: 'OK',
            headers: {'Content-Type': 'application/javascript'}
        };
        const path = arg.url.pathname.split('/');
        let id = 0;
        if(path[1] === 'project'){
            id = project.id;
        }
        else if( ! isNaN(path[1])){ // if is number
            id = Number(path[1])
        }
        let filename = path[2];
        const file = await db.loadFileByName(id, filename);
        return new Response(file.content, init);
    }
    catch(error){
        console.log(`could not load user file '${arg.url.pathname}'`, error);
        return fetch(arg.request);
    }
}