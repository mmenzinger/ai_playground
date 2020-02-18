export const MODAL_SHOW = 'MODAL_SHOW';
export const MODAL_HIDE = 'MODAL_HIDE';

export function showModal(data){
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            dispatch({ type: MODAL_SHOW, data, resolve, reject });
        });
    };
}

export function hideModal(){
    return {
        type: MODAL_HIDE
    };
}