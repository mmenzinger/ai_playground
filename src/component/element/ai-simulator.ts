import { html } from 'lit-element';
import { MobxLitElement } from '@adobe/lit-mobx';
import { toJS } from 'mobx';
import projectStore from '@store/project-store';

import '@element/c4f-console';
import { getComponents } from '@src/webpack-utils';
import { Sandbox } from '@sandbox';
import { Defer } from '@util';
import { Scenario } from '@scenario/scenario';
import { LogType } from '@store/types';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './ai-simulator.css';


class AiSimulator extends MobxLitElement {
    #sandbox = new Defer<Sandbox>();
    #scenarioLoaded = new Defer<boolean>();
    #scenario = new Defer<Scenario>();

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
        this.#scenario = new Defer<Scenario>();
        if(project){
            const type = project.scenario;
            import(`@scenario/${type}/scenario-${type}`).then(_ => {
                this.#scenarioLoaded.resolve(true);
            });
            const components = Object.entries(getComponents()).map(([name, exports]) => {
                const active = name.substr(9) === type;
                if(active){
                    console.log(toJS(project.settings));
                    return exports.getHtmlElement(active, toJS(project.settings));
                }
                return exports.getHtmlElement();
                
            });
            return html`
                <div id="wrapper">
                <header>
                    <button class="ok" @click=${this.simRun}>run</button>
                    <button class="warning" @click=${this.simTrain}>train</button>
                    <button class="error" @click=${this.simTerminate}>terminate</button>
                </header>
                ${components}
                </div>
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
        const scenario = this.shadowRoot?.querySelector('[active]') as Scenario;
        if(scenario){
            /*const settings = projectStore.activeProject?.settings;
            if(settings){
                scenario.init(settings);
            }*/
            this.#scenario.resolve(scenario);
            this.#sandbox.resolve(new Sandbox(scenario));
            if(scenario.getAutorun()){   
                this.simRun()
            }
        }
    }
}

window.customElements.define('ai-simulator', AiSimulator);
