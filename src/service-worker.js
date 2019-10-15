import {registerRoute} from 'workbox-routing/registerRoute.mjs';
import LocalDB from 'src/localdb';

const db = LocalDB();

registerRoute(
    /\.js$/,
    test
);
async function test(arg){
   // console.log(arg);
    //console.log(db.loadState());
    return fetch(arg.request);
}