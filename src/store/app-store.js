// @flow
import { observable, action, flow, autorun, toJS } from 'mobx';
import settingsStore from '@store/settings-store.js';
import projectStore from '@store/project-store.js';
import { defer } from 'src/util.js';

import type { Project, Modal } from '@types';

class AppStore{
    @observable page = '';
    @observable params = [];
    @observable offline = false;
    @observable modal: ?Modal = null;

    navigate = flow(function*(path, search){
        const urlParams = new URLSearchParams(search);
        const params = {};
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
                    yield projectStore.openProject(id);
                }
                break;
            case 'projects':
                import('@page/ai-project-index.js');
                yield projectStore.closeProject();
                break;
            case 'welcome':
                import('@page/ai-welcome.js');
                yield projectStore.closeProject();
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
                yield projectStore.closeProject();
        }

        this.page = page;
        this.params = params;
    })

    @action
    async updateOfflineStatus(offline: boolean){
        this.offline = offline;
    }


    showModal = flow(function*(template, data) {
        // lazy load modal
        yield import(`modals/modal-${template}.js`);

        if(this.modal){
            this.modal.result.reject(Error("Previous modal not closed!"));
        }

        const result = defer();
        this.modal = { template, data, result }

        return result;
    })

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
    autorun(reaction => {
        console.log('---- appStore update ----', toJS(appStore));
    });
}

export default appStore;