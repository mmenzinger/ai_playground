import { autorun, toJS, makeAutoObservable } from 'mobx';
import { ModalHandlerFunctions } from '@elements/modal/modal-handler';
// import { ModalTemplate, ModalObject } from '@elements/modal';

class AppStore {
    page = '';
    params: string[][] = [];
    offline = false;
    modalHandler: ModalHandlerFunctions | null = null;
    reportOpen = false;

    constructor(){
        makeAutoObservable(this);
    }

    async updateOfflineStatus(offline: boolean): Promise<void> {
        this.offline = offline;
    }

    openModal(name: string, props?: any): Promise<any>{
        const handler = this.modalHandler;
        if(handler){
            return handler.openModal(name, props);
        }
        else{
            throw new Error('Modal handler not ready');
        }
    }

    resolveModal(value: any){
        this.modalHandler?.resolveModal(value);
    }

    rejectModal(error: Error){
        this.modalHandler?.rejectModal(error);
    }

    openReport() {
        this.reportOpen = true;
    }

    closeReport() {
        this.reportOpen = false;
    }
}



export const appStore = new AppStore();

export function debugAppStore() {
    autorun(_ => {
        console.log('---- appStore update ----', toJS(appStore));
    });
}

export default appStore;