import { html } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat.js';
import projectStore from 'store/project-store.js';
import { MobxLitElement } from '@adobe/lit-mobx';
import db from 'src/localdb';

import sharedStyles from '@shared-styles';
import style from './c4f-console.css';

class C4fConsole extends MobxLitElement {
    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    constructor(){
        super();
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
        const wrapper = this.shadowRoot.querySelector('div#console');
        // scroll to bottom
        wrapper.scrollTop = wrapper.scrollHeight;
        setTimeout(() => { // wait for until to finish, then scroll again
            wrapper.scrollTop = wrapper.scrollHeight;
        }, 100);
    }

    getLogHtml(log){
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
        if(log.caller){
            const fileId = log.caller.fileId;
            const fileName = log.caller.fileName;
            const lineNumber = log.caller.lineNumber;
            const columnNumber = log.caller.columnNumber;
            const functionName = log.caller.functionName;
            const fileState = {
                cursor: {
                    line: lineNumber,
                    column: columnNumber,
                }
            }
            return html`<p class="${log.type}"><a class="file" @click=${e=>{this.onClick(fileId, fileState)}}>${fileName}:${functionName}:${lineNumber}</a>${args}</p>`;
        }
        else{
            return html`<p class="${log.type}">${args.join(' ')}</p>`;
        }
    }

    onClick(fileId, fileState){
        projectStore.openFile(fileId, fileState);
    }
}

window.customElements.define('c4f-console', C4fConsole);
