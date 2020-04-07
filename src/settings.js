const STORAGE_KEY = 'settings';

class Settings{
    constructor(){
        this._settings = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if(!this._settings){
            this._settings = {}
        }
    }

    set(key, value){
        this._settings[key] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._settings))
    }

    get(key){
        return this._settings[key];
    }
}

export const settings = new Settings();
export default settings;