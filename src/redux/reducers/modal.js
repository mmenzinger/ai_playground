import {
    MODAL_SHOW,
    MODAL_HIDE,
} from 'actions/modal.js';

const INITIAL_STATE = {
    data: undefined,
    resolve: undefined,
    reject: undefined,
};

const modal = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case MODAL_SHOW:
            return {
                ...state,
                data: action.data,
                resolve: action.resolve,
                reject: action.reject, 
            };
        case MODAL_HIDE:
            return {
                ...state,
                data: undefined,
                resolve: undefined,
                reject: undefined, 
            };
        default:
            return state;
    }
};

export default modal;
