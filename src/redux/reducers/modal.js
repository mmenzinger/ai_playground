import {
    MODAL_SHOW,
    MODAL_HIDE,
} from 'actions/modal.js';

const INITIAL_STATE = {
    template: null,
    data: null,
};

const modal = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case MODAL_SHOW:
            return {
                ...state,
                template: action.template,
                data: action.data,
            };
        case MODAL_HIDE:
            return INITIAL_STATE;
        default:
            return state;
    }
};

export default modal;
