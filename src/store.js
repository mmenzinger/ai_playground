import {
    createStore,
    compose,
    applyMiddleware,
    combineReducers
} from 'redux';
import thunk from 'redux-thunk';
import { lazyReducerEnhancer } from 'pwa-helpers/lazy-reducer-enhancer.js';

import app from './reducers/app.js';
import files from 'reducers/files.js';

import LocalDB from 'src/localdb';

// Sets up a Chrome extension for time travel debugging.
// See https://github.com/zalmoxisus/redux-devtools-extension for more information.
const devCompose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const db = LocalDB();

export const store = createStore(
    state => state,
    db.loadState(),
    devCompose(
        lazyReducerEnhancer(combineReducers),
        applyMiddleware(thunk) // async action support
    )
);

// Initially loaded reducers.
store.addReducers({
    app,
    files,
});

store.subscribe(() => { // TODO: throttle
    db.saveState(store.getState());
})

