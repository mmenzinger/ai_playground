import { observable, action, decorate, autorun } from 'mobx';

const STORAGE_KEY = 'settings';

class SettingsStore{
    constructor(){
        this.data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if(!this.data){
            this.data = {}
        }
    }

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

decorate(SettingsStore, {
    data: observable,

    set: action,
    get: action,
});

export const settingsStore = new SettingsStore();

// store settings to localStorage
autorun(reaction => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsStore.data))
});

export function debugSettingsStore(){
    autorun(reaction => {
        console.log('---- settingsStore update ----', JSON.parse(JSON.stringify(settingsStore)));
    });
}

export default settingsStore;