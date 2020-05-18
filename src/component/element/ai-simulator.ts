import { html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { MobxLitElement } from '@adobe/lit-mobx';
import projectStore from '@store/project-store';

import '@element/c4f-console';
import { getComponents } from '@src/webpack-utils';
import { Sandbox } from '@sandbox';
import { Defer, thisShouldNotHappen } from '@util';
import { IScenario } from '@scenario/types';
import { LogType } from '@store/types';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './ai-simulator.css';


class AiSimulator extends MobxLitElement {
    #sandbox = new Defer<Sandbox>();
    #scenarioLoaded = new Defer<boolean>();
    #scenario = new Defer<IScenario>();

    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    render() {
        const project = projectStore.activeProject;
        if(this.#sandbox.resolved)
            this.#sandbox.value?.terminate();
        this.#sandbox = new Defer<Sandbox>();
        this.#scenario = new Defer<IScenario>();
        if(project){
            const type = project.scenario;
            import(`@scenario/${type}/scenario-${type}`).then(_ => {
                this.#scenarioLoaded.resolve(true);
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
        for(const errors of Object.values(projectStore.activeProject?.errors || {})){
            for(const error of errors){
                projectStore.addLog(LogType.ERROR, error.args, error.caller);
            }
        }
        const sandbox = await this.#sandbox.promise;
        const scenario = await this.#scenario.promise
        sandbox.call(scenario.getFile(), '__run', [scenario.getSettings()]);
    }

    async simTrain() {
        /*projectStore.flushFile();
        projectStore.clearLog();
        if(projectStore.activeErrors){
            projectStore.activeErrors.forEach(error => {
                projectStore.addLog(error.type, error.args, error.caller);
            });
        }
        else{
            const sandbox = await this.#sandbox;
            //sandbox.scenario = this._scenario;
            sandbox.call('/project/index.js', 'train');
        }*/
        projectStore.flushFile();
        projectStore.clearLog();
        for(const errors of Object.values(projectStore.activeProject?.errors || {})){
            for(const error of errors){
                projectStore.addLog(LogType.ERROR, error.args, error.caller);
            }
        }
        const sandbox = await this.#sandbox.promise;
        const scenario = await this.#scenario.promise
        sandbox.call('/project/index.js', 'train');
    }

    async simTerminate() {
        const sandbox = await this.#sandbox.promise;
        sandbox.terminate();
        const msg = `simulation terminated!`;
        projectStore.addLog(LogType.WARN, [msg]);
        console.warn(msg);
    }

    async updated(){
        await this.#scenarioLoaded;
        await navigator.serviceWorker.ready; // make sure sw is ready
        const scenario = this.shadowRoot?.querySelector('[active]') as IScenario;
        if(scenario){
            this.#scenario.resolve(scenario);
            this.#sandbox.resolve(new Sandbox(scenario));
            if(scenario.getAutorun()){   
                this.simRun()
            }
        }
    }
}

window.customElements.define('ai-simulator', AiSimulator);
