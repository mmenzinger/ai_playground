import { observable, action, decorate, autorun } from 'mobx';
import settingsStore from 'store/settings-store.js';
import projectStore from 'store/project-store.js';
import { defer } from 'src/util.js';

class AppStore{
    constructor(){
        this.page = '';
        this.params = [];
        this.offline = false;
        this.modal = null;
    }

    async navigate(path, search){
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
                    await projectStore.openProject(id);
                break;
            case 'projects':
                import('components/pages/ai-project-index.js');
                await projectStore.closeProject();
                break;
            case 'welcome':
                import('components/pages/ai-welcome.js');
                await projectStore.closeProject();
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
                await projectStore.closeProject();
        }

        this.page = page;
        this.params = params;
    };

    async updateOfflineStatus(offline){
        this.offline = offline;
    }


    async showModal(template, data) {
        // lazy load modal
        await import(`modals/modal-${template}.js`);

        if(this.modal){
            this.modal.result.reject(Error("Previous modal not closed!"));
        }

        const result = defer();
        this.modal = { template, data, result }

        return result;
    }

    async resolveModal(data){
        this.modal.result.resolve(data);
        this.modal = null;
    }

    async rejectModal(data){
        this.modal.result.reject(data);
        this.modal = null;
    }
}

decorate(AppStore, {
    page: observable,
    params: observable,
    offline: observable,
    modal: observable,

    navigate: action,
    updateOfflineStatus: action,
    showModal: action,
    resolveModal: action,
    rejectModal: action,
});

export const appStore = new AppStore();

export function debugAppStore(){
    autorun(reaction => {
        console.log('---- appStore update ----', JSON.parse(JSON.stringify(appStore)));
    });
}

export default appStore;