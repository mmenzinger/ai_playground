import { html, TemplateResult } from 'lit-element';
import projectStore from '@store/project-store';
import appStore from '@store/app-store';
import settingsStore from '@store/settings-store';
import db from '@localdb';
import { MobxLitElement } from '@adobe/lit-mobx';
import { toJS } from 'mobx';
import { until } from 'lit-html/directives/until';
import { Defer } from '@util';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './c4f-bug-tracker.css';


async function sendReport(json: string){
    return fetch('https://api.subset42.com?token=eAg4FPusH8uyvzEFzF9DByA5Gh89Fz', {
        method: 'post',
        body: json,
    })
    .then(response => response.json());
}

function getStoredReports(): {[hash:string]: string}{
    return JSON.parse(localStorage.getItem('unsent-bug-reports') || '{}');
}

function setStoredReports(reports: {[hash:string]: string}){
    localStorage.setItem('unsent-bug-reports', JSON.stringify(reports));
}


class C4fBugTracker extends MobxLitElement {
    static get properties() {
        return {
            open: { type: Boolean },
        }
    }

    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    open = false;
    #sent: Defer<TemplateResult>;
    #result: Defer<TemplateResult>;
    #minDescLength = 20;
    #countdownTimer = 10;

    constructor(){
        super();

        setTimeout(async () => {
            const storedReports = getStoredReports();

            for(const [hash, data] of Object.entries(storedReports)){
                const response = await sendReport(data);
                if(response?.success === true){
                    console.log("report sent");
                    delete storedReports[hash];
                }
            }
            setStoredReports(storedReports);
        }, 1000);
    }

    render() {
        let projectFiles: TemplateResult | null = null;
        if(projectStore.activeProject){
            projectFiles = html`
                <li>
                    <div>
                        <label for="project" title="This should be used when reporting code-specific errors.">Include project files</label>
                        <input type="checkbox" id="project">
                    </div>
                </li>
            `;
        }
        if(this.open){
            return html`
            <button class="error" @click=${this.onClick}>Report Bug</button>
            <form id="form" autocomplete="off" action="javascript:void(0);">
                <header>
                    <h1>Report Bug</h1>
                </header>
                ${until(this.#sent.promise, html`
                    <p>The current state of the application will be added to the report. Make sure to report from wherever the problem occurred.</p>
                    <ul>
                        <li>
                            <textarea id="description" class="error" placeholder="Description" @input=${this.onDescriptionChange}></textarea>
                            <div id="characterCounter">0/${this.#minDescLength}</div>
                        </li>
                        ${projectFiles}
                    </ul>
                    <footer>
                        <button id="no" class="error" @click=${this.onAbort}>Cancel</button>
                        <button id="yes" class="ok" @click=${this.onSubmit}>Report</button>
                    </footer>
                `)}
            </form>
        `;
        }
        else{
            return html`
                <button @click=${this.onClick}>Report Bug</button>
            `;
        }
    }

    updated(){
        const description = this.shadowRoot?.getElementById('description');
        const report = this.shadowRoot?.getElementById('yes') as HTMLButtonElement;
        if(description){
            description.focus();
        }
        if(report){
            let counter = this.#countdownTimer;
            report.disabled = true;
            report.classList.remove('ok');
            function countdown(){
                if(counter > 1){
                    counter--;
                    report.innerText = `${counter}`;
                    setTimeout(countdown, 1000);
                }
                else{
                    report.disabled = false;
                    report.innerText = `Report`;
                    report.classList.add('ok');
                }
            }
            countdown();
        }
    }

    close(){
        this.open = false;
    }

    onDescriptionChange(event: Event){
        const counterElement = this.shadowRoot?.getElementById('characterCounter') as HTMLDivElement;
        const descriptionElement = event.target as HTMLTextAreaElement;
        const length = descriptionElement.textLength;
        if(length < this.#minDescLength){
            counterElement.innerText = `${descriptionElement.textLength}/${this.#minDescLength}`;
            descriptionElement.classList.add('error');
            descriptionElement.classList.remove('ok');
        }
        else{
            counterElement.innerText = ``;
            descriptionElement.classList.add('ok');
            descriptionElement.classList.remove('error');
        }
    }

    onAbort(){
        this.close();
    }

    async onSubmit(){
        const descriptionElement = this.shadowRoot?.getElementById('description') as HTMLTextAreaElement;
        const projectFilesElement = this.shadowRoot?.getElementById('project') as HTMLInputElement;

        const description = descriptionElement.value;
        if(descriptionElement.textLength < this.#minDescLength){
            descriptionElement.focus();
            return;
        }

        const projectStoreData = toJS(projectStore);
        const appStoreData = toJS(appStore);
        const settingsStoreData = toJS(settingsStore);
        let files = [];
        if(projectFilesElement?.checked && projectStore.activeProject?.id){
            files.push(...await db.getProjectFiles(0));
            files.push(...await db.getProjectFiles(projectStore.activeProject?.id));
        }

        const data = JSON.stringify({
            description,
            appStore: appStoreData,
            projectStore: projectStoreData,
            settingsStore: settingsStoreData,
            files,
        });

        this.#result = new Defer<TemplateResult>();
        sendReport(data).then(response => {
            if(response?.success === true){
                this.#result.resolve(html`
                <p>The report was successfully sent.</p>
                <p>Thanks for helping to improve this project!</p>
                <footer>
                    <button id="yes" class="ok" @click=${this.close}>Close</button>
                </footer>
            `);
            }
            else{
                // store report in local storage, use hash as key
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(data)).then(digest => {
                    const hash = new TextDecoder().decode(digest);
                    const storedReports = getStoredReports();
                    storedReports[hash] = data;
                    setStoredReports(storedReports);
                });
                this.#result.resolve(html`
                    <p>There was an error, the report will be stored and sent at a later time.</p>
                    <p>Thanks for helping to improve this project!</p>
                    <footer>
                        <button id="yes" class="warning" @click=${this.close}>Close</button>
                    </footer>
                `);
            }
        });

        this.#sent.resolve(html`
            ${until(this.#result.promise, html`
                <p>sending...</p>
            `)}
        `);
    }

    onClick(){
        if(this.open){
            this.onAbort();
        }
        else{
            this.#sent = new Defer<TemplateResult>();
            this.open = true;
        }
    }
}

window.customElements.define('c4f-bug-tracker', C4fBugTracker);
