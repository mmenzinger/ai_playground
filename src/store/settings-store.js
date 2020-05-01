import { observable, action, autorun, toJS } from 'mobx';

const STORAGE_KEY = 'settings';

class SettingsStore{
    @observable data = JSON.parse(localStorage.getItem(STORAGE_KEY) || {});

    @action
    set(key, value){
        this.data[key] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    }

    get(key, fallback = undefined){
        if(this.data[key])
            return this.data[key];
        else
            return fallback;
    }
}

export const settingsStore = new SettingsStore();

// save settings to localStorage
autorun(reaction => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsStore.data))
});

export function debugSettingsStore(){
    autorun(reaction => {
        console.log('---- settingsStore update ----', toJS(settingsStore));
    });
}

export default settingsStore;