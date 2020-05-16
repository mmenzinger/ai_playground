import { html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { MobxLitElement } from '@adobe/lit-mobx';
import projectStore from '@store/project-store';

import '@element/c4f-console';
import { getComponents } from '@src/webpack-utils';
import { Sandbox } from '@sandbox';
import { defer } from '@util';

import sharedStyles from '@shared-styles';
import style from './ai-simulator.css';


class AiSimulator extends MobxLitElement {
    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    constructor() {
        super();
        this._sandbox = defer();
        this._scenarioLoaded = defer();
        this._scenario = null;
    }

    render() {
        const project = projectStore.activeProject;
        if(this._sandbox.resolved)
            this._sandbox.value.terminate();
        this._sandbox = defer();
        this._scenarioLoaded = defer();
        if(project){
            const type = project.scenario;
            import(`@scenario/${type}/scenario-${type}`).then(_ => {
                this._scenarioLoaded.resolve(true);
            });
            const components = getComponents().map(name => {
                const active = name.substr(9) === type ? ' active' : '';
                return unsafeHTML(`<${name}${active}></${name}>`);
            });
            return html`
                <button class="ok" @click=${this.simRun}>run</button>
                <button class="warning" @click=${this.simTrain}>train</button>
                <button class="error" @click=${this.simTerminate}>terminate</button>
                ${components}
            `;
        }
        else{
            return html``;
        }
    }

    async simRun() {
        projectStore.flushFile();
        projectStore.clearLog();
        if(projectStore.activeErrors){
            projectStore.activeErrors.forEach(error => {
                projectStore.addLog(error.type, error.args, error.caller);
            });
        }
        else{
            const sandbox = await this._sandbox;
            sandbox.call(this._scenario.constructor.file, '__run', [{settings: this._scenario.getSettings()}]);
        }
    }

    async simTrain() {
        projectStore.flushFile();
        projectStore.clearLog();
        if(projectStore.activeErrors){
            projectStore.activeErrors.forEach(error => {
                projectStore.addLog(error.type, error.args, error.caller);
            });
        }
        else{
            const sandbox = await this._sandbox;
            //sandbox.scenario = this._scenario;
            sandbox.call('/project/index.js', 'train');
        }
    }

    async simTerminate() {
        const sandbox = await this._sandbox;
        sandbox.terminate();
        const msg = `simulation terminated!`;
        projectStore.addLog('warn', [msg]);
        console.warn(msg);
    }

    async updated(){
        await this._scenarioLoaded;
        await navigator.serviceWorker.ready; // make sure sw is ready
        this._scenario = this.shadowRoot.querySelector('[active]');
        this._sandbox.resolve(new Sandbox(this._scenario));
        if(this._scenario.constructor.autorun){   
            this.simRun()
        }
    }
}

window.customElements.define('ai-simulator', AiSimulator);
