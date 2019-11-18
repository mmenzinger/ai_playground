import { html, unsafeCSS, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from 'src/store';
import db from 'src/localdb';

import { openFile } from 'actions/files';
import { subscribeLog, LOG_ADD, LOG_CLEAR } from 'actions/log';


const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());
const style = unsafeCSS(require('./c4f-console.css').toString());

  
class C4fConsole extends LitElement {
    static get properties() {
        return {
            _logs: { type: Array },
        }
    }

    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    constructor(){
        super();
        this._logs = [];
        store.dispatch(subscribeLog(this.onLog.bind(this)));
    }

    render() {
        return html`<div id="wrapper">${this._logs}</div>`;
    }

    updated(){
        // scroll to bottom
        this.shadowRoot.querySelector('div#wrapper').scrollIntoView(false);
    }

    async onLog(action){
        switch(action.type){
            case LOG_ADD:
                const element = await this.getLogHtml(action.log);
                this._logs = [...this._logs, element];
                break;
            
            case LOG_CLEAR:
                this._logs = [];
                break;
        }
    }

    async getLogHtml(log){
        const args = log.args.map(arg => {
            arg = arg.replace(/\{\s*"type":\s*"__FUNCTION__",\s*"name":\s*"(\w+)"\s*\}/g, '$1()');
            arg = arg.replace(/\{\s*"type":\s*"__ERROR__",\s*"message":\s*"(.*?)"[^]*?\}/g, 'Error: $1');
            arg = arg.replace(/\{\s*"type":\s*"__MAP__",\s*"data":\s*([^]*?)\s*\}/g, 'Map($1)');
            arg = arg.replace(/\{\s*"type":\s*"__SET__",\s*"data":\s*([^]*?)\s*\}/g, 'Set($1)');
            arg = arg.replace(/\{\s*"type":\s*"__DATE__",\s*"timestamp":\s*(\d*)\s*\}/g, (_,timestamp) => {
                return new Date(Number(timestamp));
            });
            arg = arg.replace('"__UNDEFINED__"', 'undefined');
            arg = arg.replace('"__+INFINITY__"', 'Infinity');
            arg = arg.replace('"__-INFINITY__"', '-Infinity');
            arg = arg.replace('"__NAN__"', 'NaN');
            arg = arg.replace(/"(\w+)":/g, '$1:'); // attributes
            arg = arg.replace(/^"([^]*)"$/g, '$1'); // strings
            return arg;
        });
        try{ // add caller if valid
            const state = store.getState();
            let matches = log.caller.match(/local\/(\d+)\/(\w+\.\w+):(\d+)$/);
            if(matches === null){ // uncaught exception -> try files, project first
                matches = log.caller.match(/(\w+\.\w+):(\d+)$/);
                let file = await db.loadFileByName(state.projects.currentProject, matches[1]);
                if(file)
                    matches.splice(1, 0, state.projects.currentProject);
                else
                    matches.splice(1, 0, 0);
            }
            const project = Number(matches[1]);
            const filename = matches[2];
            const linenumber = Number(matches[3]);
            const file = await db.loadFileByName(project, filename);
            return html`<p class="${log.type}"><a class="file" @click=${e=>{this.onClick(file)}}>${filename}:${linenumber}</a>${args}</p>`;
        }
        catch(e){
            return html`<p class="${log.type}">${args.join(' ')}</p>`;
        }
        
    }

    onClick(file){
        store.dispatch(openFile(file.id));
    }
}

window.customElements.define('c4f-console', C4fConsole);
