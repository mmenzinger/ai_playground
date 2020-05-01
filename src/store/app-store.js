import { observable, action, flow, autorun, toJS } from 'mobx';
import settingsStore from 'store/settings-store.js';
import projectStore from 'store/project-store.js';
import { defer } from 'src/util.js';

class AppStore{
    @observable page = '';
    @observable params = [];
    @observable offline = false;
    @observable modal = null;

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
                import('components/pages/ai-project.js');
                const id = Number(params['project']);
                if(id)
                    yield projectStore.openProject(id);
                break;
            case 'projects':
                import('components/pages/ai-project-index.js');
                yield projectStore.closeProject();
                break;
            case 'welcome':
                import('components/pages/ai-welcome.js');
                yield projectStore.closeProject();
                break;
            case 'index':
            default:
                if(settingsStore.get('skip_welcome')){
                    import('components/pages/ai-project-index.js');
                    page = 'projects';
                }
                else{
                    import('components/pages/ai-welcome.js');
                    page = 'welcome';
                }
                yield projectStore.closeProject();
        }

        this.page = page;
        this.params = params;
    })

    @action
    async updateOfflineStatus(offline){
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
    async resolveModal(data){
        this.modal.result.resolve(data);
        this.modal = null;
    }

    @action
    async rejectModal(data){
        this.modal.result.reject(data);
        this.modal = null;
    }
}

export const appStore = new AppStore();

export function debugAppStore(){
    autorun(reaction => {
        console.log('---- appStore update ----', toJS(appStore));
    });
}

export default appStore;