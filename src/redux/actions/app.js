export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';

import store from 'src/store.js';

import { openProject, closeProject } from 'actions/projects.js';

export const navigate = (path, search) => (dispatch) => {
    const urlParams = new URLSearchParams(search);
    let page = urlParams.get('page')
    if(!page) 
        page = 'index';
    const params = {};
    for(const pair of urlParams)
        params[pair[0]] = pair[1];
    dispatch(loadPage(page, params));
};

const loadPage = (page, params) => async dispatch => {
    // lazy load pages
    switch (page) {
        case 'project':
            import('components/pages/ai-project.js');
            const id = Number(params['id']);
            if(id)
                await store.dispatch(openProject(id));
            break;
        case 'index':
        default:
            import('components/pages/ai-project-index.js');
            page = 'index';
            await store.dispatch(closeProject());
    }

    dispatch({
        type: UPDATE_PAGE,
        page,
        params,
    });
};

export const updateOffline = (offline) => (dispatch) => {
    dispatch({
        type: UPDATE_OFFLINE,
        offline
    });
};