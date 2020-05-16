import { observable, action, autorun, toJS, runInAction } from 'mobx';
import settingsStore from '@store/settings-store';
import projectStore from '@store/project-store';
import { defer } from '@util';

import { Modal } from '@store/types';

type Params = {[key: string]: string};

class AppStore{
    @observable page = '';
    @observable params:Params = {};
    @observable offline = false;
    @observable modal: Modal | null = null;

    @action
    async navigate(_: string, search: string): Promise<void>{
        const urlParams = new URLSearchParams(search);
        const params: Params = {};
        for(const pair of urlParams)
            params[pair[0]] = pair[1];
        let page = Object.keys(params)[0];
        if(!page) 
            page = 'index';
        
        switch (page) {
            case 'project':
                import('@page/ai-project.js');
                const id = Number(params['project']);
                if(id){
                    await projectStore.openProject(id);
                }
                break;
            case 'projects':
                import('@page/ai-project-index.js');
                await projectStore.closeProject();
                break;
            case 'welcome':
                import('@page/ai-welcome.js');
                await projectStore.closeProject();
                break;
            case 'index':
            default:
                if(settingsStore.get('skip_welcome')){
                    import('@page/ai-project-index.js');
                    page = 'projects';
                }
                else{
                    import('@page/ai-welcome.js');
                    page = 'welcome';
                }
                await projectStore.closeProject();
        }

        runInAction(() => {
            this.page = page;
            this.params = params;
        })
    }

    @action
    async updateOfflineStatus(offline: boolean): Promise<void>{
        this.offline = offline;
    }

    @action
    async showModal(template: string, data: object): Promise<void>{
        // lazy load modal ${template}
        await import(`@modal/modal-${template}`);

        const result = defer();
        runInAction(() => {
            if(this.modal){
                this.modal.result.reject(Error("Previous modal not closed!"));
            }
            this.modal = { template, data, result }
        });
        return result;
    }

    @action
    async resolveModal(data: any){
        if(this.modal){
            this.modal.result.resolve(data);
            this.modal = null;
        }
    }

    @action
    async rejectModal(data: any){
        if(this.modal){
            this.modal.result.reject(data);
            this.modal = null;
        }
    }
}



export const appStore = new AppStore();

export function debugAppStore(){
    autorun(_ => {
        console.log('---- appStore update ----', toJS(appStore));
    });
}

export default appStore;