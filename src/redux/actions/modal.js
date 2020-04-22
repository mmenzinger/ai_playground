import { defer } from 'src/util.js';

export const MODAL_SHOW = 'MODAL_SHOW';
export const MODAL_HIDE = 'MODAL_HIDE';

let result = null;

export const showModal = (template, data) => async dispatch => {
    // lazy load modal
    await import(`modals/modal-${template}.js`);

    if(result){
        result.reject(Error("Previous modal not closed!"));
    }
    result = defer();
    
    dispatch({
        type: MODAL_SHOW,
        template,
        data,
    });

    return result;
}

export function resolveModal(data){
    result.resolve(data);
    result = null;

    return {
        type: MODAL_HIDE,
    };
}

export function rejectModal(data){
    result.reject(data);
    result = null;

    return {
        type: MODAL_HIDE,
    };
}