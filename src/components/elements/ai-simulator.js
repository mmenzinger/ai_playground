import { html, LitElement, unsafeCSS } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { MobxLitElement } from '@adobe/lit-mobx';
import projectStore from 'store/project-store.js';

import 'components/elements/c4f-console.js';
import { getComponents } from 'src/webpack-utils.js';
import { Sandbox } from 'src/sandbox.js';
import { defer } from 'src/util.js';

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./ai-simulator.css').toString());


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
            import(`scenario/${type}/scenario-${type}`).then(_ => {
                this._scenarioLoaded.resolve(true);
            });
            const components = getComponents().map(name => {
                const active = name.substr(9) === type ? ' active' : '';
                return unsafeHTML(`<${name}${active}></${name}>`);
            });
            return html`
                <button @click=${this.simRun}>run</button>
                <button @click=${this.simTrain}>train</button>
                <button @click=${this.simTerminate}>terminate</button>
                ${components}
            `;
        }
        else{
            return html``;
        }
    }

    async simRun() {
        projectStore.flushActiveFile();
        projectStore.clearLog();
        const sandbox = await this._sandbox;
        //sandbox.scenario = this._scenario;
        sandbox.call(this._scenario.constructor.file, '__run', [{settings: this._scenario.getSettings()}]);
    }

    async simTrain() {
        projectStore.flushActiveFile();
        projectStore.clearLog();
        const sandbox = await this._sandbox;
        //sandbox.scenario = this._scenario;
        sandbox.call('/project/index.js', 'train');
    }

    async simTerminate() {
        const sandbox = await this._sandbox;
        sandbox.terminate();
        const msg = `simulation terminated!`;
        projectStore.addLog({ type: 'warn', args: [msg] });
        console.warn(msg);
    }

    async updated(){
        await this._scenarioLoaded;
        await navigator.serviceWorker.ready; // make sure sw is ready
        this._scenario = this.shadowRoot.querySelector('[active]');
        this._sandbox.resolve(new Sandbox(projectStore, this._scenario));
        if(this._scenario.constructor.autorun){   
            this.simRun()
        }
    }
}

window.customElements.define('ai-simulator', AiSimulator);
