export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';


export const navigate = (path, hash) => (dispatch) => {
    const params = hash.length < 2 ? 'index' : hash.slice(1).split('/');
    const page = Array.isArray(params) ? params.shift() : params;
    dispatch(loadPage(page, params));
};

const loadPage = (page, params) => (dispatch) => {
    // lazy load pages
    switch (page) {
        case 'index':
            import('components/ai-project-index.js');
            params = [];
            break;
        case 'project':
            import('components/ai-project.js');
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