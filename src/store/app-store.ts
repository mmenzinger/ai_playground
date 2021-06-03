import { observable, action, autorun, toJS, runInAction, makeObservable } from 'mobx';
// import settingsStore from '@store/settings-store';
// import projectStore from '@store/project-store';
import { Defer } from '@util';
import { ModalTemplate, ModalObject } from '@elements/modal';

// import { NEWS_VERSION } from '@page/ai-news';

class AppStore {
    page = '';
    params: string[][] = [];
    offline = false;
    modal: ModalObject | null = null;
    modalOpen = false;
    reportOpen = false;

    constructor(){
        makeObservable(this, {
            page: observable,
            params: observable,
            offline: observable,
            modalOpen: observable,
            reportOpen: observable,
            // navigate: action,
            updateOfflineStatus: action,
            // showModal: action,
            resolveModal: action,
            rejectModal: action,
            openReport: action,
            closeReport: action,
        });
    }

    // async navigate(_path: string, _search: string): Promise<void> {
    //     let page = 'index';
    //     let params: string[][] = [];
    //     try {
    //         const hash = location.hash.substr(1);
    //         params = hash ? hash.split('&').map(param => param.split('=')) : [];
    //         if (params.length) {
    //             page = params[0][0];
    //         }

    //         switch (page) {
    //             case 'project':
    //                 import('@page/ai-project');
    //                 const id = Number(params[0][1]);
    //                 if (id) {
    //                     await projectStore.openProject(id);
    //                 }
    //                 break;
    //             case 'projects':
    //                 import('@page/ai-project-index');
    //                 await projectStore.closeProject();
    //                 break;
    //             case 'news':
    //                 import('@src/component/page/ai-news');
    //                 await projectStore.closeProject();
    //                 break;
    //             case 'impressum':
    //                 import('@page/ai-impressum');
    //                 await projectStore.closeProject();
    //                 break;
    //             case 'index':
    //             default:
    //                 if ((settingsStore.get('news_version') || 0) < NEWS_VERSION) {
    //                     import('@page/ai-news');
    //                     page = 'news';
    //                 }
    //                 else {
    //                     import('@page/ai-project-index');
    //                     page = 'projects';
    //                 }
    //                 await projectStore.closeProject();
    //         }
    //     }
    //     catch(error){
    //         console.warn(error);
    //         import('@page/ai-404');
    //         page = '404';
    //     }

    //     runInAction(() => {
    //         this.page = page;
    //         this.params = params;
    //     })
    // }

    async updateOfflineStatus(offline: boolean): Promise<void> {
        this.offline = offline;
    }

    async showModal(template: ModalTemplate): Promise<any> {
        // lazy load modal ${template}
        // await import(`@modal/modal-${template}`);


        const result = new Defer<any>();
        if (this.modal) {
            this.modal.result.reject(Error("Previous modal not closed!"));
        }
        this.modal = { template, result }
        runInAction(() => {
            this.modalOpen = true;
        });
        
        return result.promise;
    }

    resolveModal(data: any | undefined) {
        if (this.modal) {
            this.modal.result.resolve(data);
            this.modal = null;
            this.modalOpen = false;
        }
    }

    rejectModal(data: any) {
        if (this.modal) {
            this.modal.result.reject(data);
            this.modal = null;
            this.modalOpen = false;
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