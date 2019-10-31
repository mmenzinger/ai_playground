export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';

import store from 'src/store';

import { openProject } from 'actions/projects';

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
        case 'index':
            import('components/ai-project-index.js');
            params = {};
            break;
        case 'project':
            import('components/ai-project.js');
            const id = Number(params['id']);
            if(id)
                await store.dispatch(openProject(id));
            break;
        default:
            import('components/ai-project-index.js');
            page = 'index';
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