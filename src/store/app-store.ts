import { observable, action, autorun, toJS, makeObservable } from 'mobx';
import { Defer } from '@src/utils';
import { ModalTemplate, ModalObject } from '@elements/modal';

class AppStore {
    page = '';
    params: string[][] = [];
    offline = false;
    modal: ModalObject | null = null;
    reportOpen = false;

    constructor(){
        makeObservable(this, {
            page: observable,
            params: observable,
            offline: observable,
            modal: observable,
            reportOpen: observable,
            updateOfflineStatus: action,
            showModal: action,
            resolveModal: action,
            rejectModal: action,
            updateModalResult: action,
            openReport: action,
            closeReport: action,
        });
    }

    async updateOfflineStatus(offline: boolean): Promise<void> {
        this.offline = offline;
    }

    async showModal(template: ModalTemplate): Promise<any> {
        const defer = new Defer<any>();
        if (this.modal) {
            this.modal.defer.reject(Error("Previous modal not closed!"));
        }
        this.modal = { template, defer }
        return defer.promise;
    }

    resolveModal(data?: any) {
        if (this.modal) {
            this.modal.defer.resolve(data || toJS(this.modal.result));
            this.modal = null;
        }
    }

    rejectModal(data?: any) {
        if (this.modal) {
            this.modal.defer.reject(data || toJS(this.modal.result));
            this.modal = null;
        }
    }

    updateModalResult(result: any){
        if(this.modal){
            this.modal.result = result;
        }
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