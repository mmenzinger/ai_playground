export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';

import { openProject, closeProject } from 'actions/projects.js';
import settings from 'src/settings.js';

export const navigate = (path, search) => (dispatch) => {
    const urlParams = new URLSearchParams(search);
    const params = {};
    for(const pair of urlParams)
        params[pair[0]] = pair[1];
    let page = Object.keys(params)[0];
    if(!page) 
        page = 'index';
    dispatch(loadPage(page, params));
};

const loadPage = (page, params) => async dispatch => {
    // lazy load pages
    switch (page) {
        case 'project':
            import('components/pages/ai-project.js');
            const id = Number(params['project']);
            if(id)
                await dispatch(openProject(id));
            break;
        case 'projects':
            import('components/pages/ai-project-index.js');
            await dispatch(closeProject());
            break;
        case 'welcome':
            import('components/pages/ai-welcome.js');
            await dispatch(closeProject());
            break;
        case 'index':
        default:
            if(settings.get('skip_welcome')){
                import('components/pages/ai-project-index.js');
                page = 'projects';
            }
            else{
                import('components/pages/ai-welcome.js');
                page = 'welcome';
            }
            await dispatch(closeProject());
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