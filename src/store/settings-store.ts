import { observable, action, autorun, toJS, makeObservable } from 'mobx';

const STORAGE_KEY = 'settings';
const STORAGE_KEY_LOCAL = 'settings-local';

class SettingsStore{
    data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    localData = JSON.parse(window.localStorage.getItem(STORAGE_KEY_LOCAL) || '{}');

    constructor(){
        makeObservable(this, {
            data: observable,
            localData: observable,
            set: action,
            setLocal: action,
        });
    }

    set(key: string, value: any){
        this.data[key] = value;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    }

    get(key: string, fallback?: any){
        if(this.data[key] !== undefined)
            return this.data[key];
        else
            return fallback;
    }

    setLocal(key: string, value: any){
        this.localData[key] = value;
        window.localStorage.setItem(STORAGE_KEY_LOCAL, JSON.stringify(this.localData))
    }

    getLocal(key: string, fallback?: any){
        if(this.localData[key] !== undefined)
            return this.localData[key];
        else
            return fallback;
    }
}

export const settingsStore = new SettingsStore();

export function debugSettingsStore(){
    autorun(_ => {
        console.log('---- settingsStore update ----', toJS(settingsStore));
    });
}

export default settingsStore;