import {registerRoute} from 'workbox-routing/registerRoute';
import {StaleWhileRevalidate} from 'workbox-strategies/StaleWhileRevalidate';
import {CacheFirst} from 'workbox-strategies/CacheFirst';
import {Plugin as ExpirationPlugin} from 'workbox-expiration/Plugin';
import db from 'src/localdb';

registerRoute(
    /\/local\/[0-9]+\//,
    localFile
);
/*registerRoute(
    /\.js$/,
    new StaleWhileRevalidate(),
);*/
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