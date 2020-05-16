import { observable, action, autorun, toJS } from 'mobx';

const STORAGE_KEY = 'settings';

class SettingsStore{
    @observable data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');

    @action
    set(key: string, value: any){
        this.data[key] = value;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    }

    get(key: string, fallback?: any){
        if(this.data[key])
            return this.data[key];
        else
            return fallback;
    }
}

export const settingsStore = new SettingsStore();

// save settings to localStorage
autorun(_ => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsStore.data))
});

export function debugSettingsStore(){
    autorun(_ => {
        console.log('---- settingsStore update ----', toJS(settingsStore));
    });
}

export default settingsStore;