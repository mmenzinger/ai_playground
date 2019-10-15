export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';

export const navigate = (path) => (dispatch) => {
    const page = path === '/' ? 'index' : path.slice(1);
    dispatch(loadPage(page));
};

const loadPage = (page) => (dispatch) => {
    // lazy load pages
    switch (page) {
        case 'index':
            import('components/ai-project-index.js');
            break;
        case 'project':
            import('components/ai-project.js');
            break;
    }

    dispatch({
        type: UPDATE_PAGE,
        page
    });
};

export const updateOffline = (offline) => (dispatch, getState) => {
    dispatch({
        type: UPDATE_OFFLINE,
        offline
    });
};
