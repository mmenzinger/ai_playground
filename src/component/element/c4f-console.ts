import { html } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import projectStore from '@store/project-store';
import { MobxLitElement } from '@adobe/lit-mobx';
import { Log, LogType, IPosition } from '@store/types';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './c4f-console.css';

class C4fConsole extends MobxLitElement {
    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    render() {
        const logs = [...projectStore.log];
        return html`<div id="console">
            ${repeat(
                logs,
                log => log,
                log => this.getLogHtml(log)
            )}
        </div>`;
    }

    updated(){
        const wrapper = this.shadowRoot?.querySelector('div#console');
        if(wrapper){
            // scroll to bottom
            wrapper.scrollTop = wrapper.scrollHeight;
            setTimeout(() => { // wait for until to finish, then scroll again
                wrapper.scrollTop = wrapper.scrollHeight;
            }, 100);
        }
    }

    getLogHtml(log: Log){
        const args = log.args.map(arg => {
            arg = arg.replace(/\{\s*"type":\s*"__FUNCTION__",\s*"name":\s*"(\w+)"\s*\}/g, '$1()');
            arg = arg.replace(/\{\s*"type":\s*"__ERROR__",\s*"message":\s*"(.*?)"[^]*?\}/g, 'Error: $1');
            arg = arg.replace(/\{\s*"type":\s*"__MAP__",\s*"data":\s*([^]*?)\s*\}/g, 'Map($1)');
            arg = arg.replace(/\{\s*"type":\s*"__SET__",\s*"data":\s*([^]*?)\s*\}/g, 'Set($1)');
            arg = arg.replace(/\{\s*"type":\s*"__DATE__",\s*"timestamp":\s*(\d*)\s*\}/g, (_: string, timestamp: string) => {
                return new Date(Number(timestamp));
            });
            arg = arg.replace('"__UNDEFINED__"', 'undefined');
            arg = arg.replace('"__+INFINITY__"', 'Infinity');
            arg = arg.replace('"__-INFINITY__"', '-Infinity');
            arg = arg.replace('"__NAN__"', 'NaN');
            arg = arg.replace('\\n', '\n');
            arg = arg.replace(/"(\w+)":/g, '$1:'); // attributes
            arg = arg.replace(/^"([^]*)"$/g, '$1'); // strings
            return arg;
        });

        let type;
        switch(log.type){
            case LogType.WARN: type = 'warn'; break;
            case LogType.ERROR: type = 'error'; break;
            default: type = 'log';
        }

        if(log.caller && log.caller.fileId){
            const fileId = log.caller.fileId;
            const line = log.caller.line;
            const column = log.caller.column;
            let scrollTo: IPosition | undefined = undefined;
            
            if(line && column){
                scrollTo = {
                    lineNumber: line,
                    column,
                }
            }
            let link = `${log.caller.fileName}`;
            if(line) link += `:${log.caller.line}`;
            for(const name of log.caller.functionNames){
                link += `:${name}`;
            }
            return html`<p class="${type}"><a class="file" @click=${()=>{this.onClick(fileId, scrollTo)}}>${link}</a>${args.join(' ')}</p>`;
        }
        else{
            return html`<p class="${type}">${args.join(' ')}</p>`;
        }
    }

    onClick(fileId: number, scrollTo?: IPosition){
        projectStore.openFile(fileId, scrollTo);
    }
}

window.customElements.define('c4f-console', C4fConsole);
