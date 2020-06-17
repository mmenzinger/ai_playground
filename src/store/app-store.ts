import { observable, action, autorun, toJS, runInAction } from 'mobx';
import settingsStore from '@store/settings-store';
import projectStore from '@store/project-store';
import { Defer } from '@util';
import { Modals } from '@element/c4f-modal';
import { ModalTemplate } from '@modal/modal-generic';
import { Modal } from '@store/types';

import { NEWS_VERSION } from '@page/ai-news';

class AppStore {
    @observable page = '';
    @observable params: string[][] = [];
    @observable offline = false;
    @observable modal: Modal | null = null;

    @action
    async navigate(_: string, search: string): Promise<void> {
        let page = 'index';
        let params: string[][] = [];
        try {
            const hash = location.hash.substr(1);
            params = hash ? hash.split('&').map(param => param.split('=')) : [];
            if (params.length) {
                page = params[0][0];
            }

            switch (page) {
                case 'project':
                    import('@page/ai-project');
                    const id = Number(params[0][1]);
                    if (id) {
                        await projectStore.openProject(id);
                    }
                    break;
                case 'projects':
                    import('@page/ai-project-index');
                    await projectStore.closeProject();
                    break;
                case 'news':
                    import('@src/component/page/ai-news');
                    await projectStore.closeProject();
                    break;
                case 'impressum':
                    import('@page/ai-impressum');
                    await projectStore.closeProject();
                    break;
                case 'index':
                default:
                    if ((settingsStore.get('news_version') || 0) < NEWS_VERSION) {
                        import('@page/ai-news');
                        page = 'news';
                    }
                    else {
                        import('@page/ai-project-index');
                        page = 'projects';
                    }
                    await projectStore.closeProject();
            }
        }
        catch(error){
            console.warn(error);
            import('@page/ai-404');
            page = '404';
        }

        runInAction(() => {
            this.page = page;
            this.params = params;
        })
    }

    @action
    async updateOfflineStatus(offline: boolean): Promise<void> {
        this.offline = offline;
    }

    @action
    async showModal(template: Modals, data: ModalTemplate): Promise<any> {
        // lazy load modal ${template}
        await import(`@modal/modal-${template}`);

        const result = new Defer<any>();
        runInAction(() => {
            if (this.modal) {
                this.modal.result.reject(Error("Previous modal not closed!"));
            }
            this.modal = { template, data, result }
        });
        return result.promise;
    }

    @action
    async resolveModal(data: any) {
        if (this.modal) {
            this.modal.result.resolve(data);
            this.modal = null;
        }
    }

    @action
    async rejectModal(data: any) {
        if (this.modal) {
            this.modal.result.reject(data);
            this.modal = null;
        }
    }
}



export const appStore = new AppStore();

export function debugAppStore() {
    autorun(_ => {
        console.log('---- appStore update ----', toJS(appStore));
    });
}

export default appStore;