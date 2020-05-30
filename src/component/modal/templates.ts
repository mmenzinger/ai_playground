import { html } from 'lit-element';
import db from '@localdb';
import { ScenarioTemplates, ScenarioTemplate } from '@src/webpack-utils';
import { Project, File } from '@store/types';
import { ModalTemplate } from '@modal/modal-generic';

//------------------------------------------------------------------------------
// New Project
//------------------------------------------------------------------------------
export function newProjectTemplate(scenarioTemplates: {[key:string]: ScenarioTemplates}): ModalTemplate {
    const scenarios = Object.values(scenarioTemplates).map(scenario => html`<option value="${scenario.name}">${Object.values(scenario.templates)[0].name}</option>`);
    const firstScenario = Object.values(scenarioTemplates)[0];
    const firstTemplate = Object.values(firstScenario.templates)[0];

    let selectedScenarioIndex = 0;
    let selectedTemplateIndex = 0;

    function updateTemplates(templateSelect: HTMLSelectElement, scenario: string){
         const templates = Object.entries(scenarioTemplates[scenario].templates).map(([key, template]) => `<option value="${key}">Default</option>`).join('');
         const examples = Object.entries(scenarioTemplates[scenario].examples).map(([key, example]) => `<option value="${key}">Example: ${example.name}</option>`).join('');
         templateSelect.innerHTML = templates + examples;
    }

    return {
        title: 'New Project',
        submit: 'Create',
        abort: 'Cancel',
    
        content: html`
            <li>
                <label for="scenario">Scenario</label>
                <select id="scenario">${scenarios}</select>
            </li>
            <li>
                <label for="template">Template</label>
                <select id="template"></select>
            </li>
            <li>
                <label for="name">Name</label>
                <input id="name" type="text" placeholder="My Project" value="${firstTemplate.name}">
            </li>
        `,
        
        init: async (shadowRoot: ShadowRoot) => {
            const scenario = shadowRoot.getElementById('scenario') as HTMLSelectElement;
            const template = shadowRoot.getElementById('template') as HTMLSelectElement;
            const name = shadowRoot.getElementById('name') as HTMLInputElement;
            scenario.selectedIndex = selectedScenarioIndex;
            updateTemplates(template, scenario.options[selectedScenarioIndex].value);
            template.selectedIndex = selectedTemplateIndex;
            name.value = template.options[selectedTemplateIndex].value;
        },
    
        check: async (fields: {[key:string]: any}) => {
            if(fields.name.length === 0)
                return Error('Empty project name! Every project must have a name.');
            if(await db.projectExists(fields.name))
                return Error('Duplicate name! A project with that name already exists!');
            return true;
        },
    
        change: {
            scenario: (e: Event, shadowRoot: ShadowRoot) => {
                const target = e.target as HTMLSelectElement;
                const template = shadowRoot.getElementById('template') as HTMLSelectElement;
                const name = shadowRoot.getElementById('name') as HTMLInputElement;
                const text = target.options[target.selectedIndex].value;
                updateTemplates(template, text);
                selectedScenarioIndex = target.selectedIndex;
                selectedTemplateIndex = 0;
                name.value = template.options[selectedTemplateIndex].value;
            },
            template: (e: Event, shadowRoot: ShadowRoot) => {
                const target = e.target as HTMLSelectElement; 
                const text = target.options[target.selectedIndex].value;
                const name = shadowRoot.getElementById('name') as HTMLInputElement;
                name.value = text;
                selectedTemplateIndex = target.selectedIndex;
            }
        },
    };
}

//------------------------------------------------------------------------------
// Delete Project
//------------------------------------------------------------------------------
export function deleteProjectTemplate(project: Project): ModalTemplate {
    return {
        title: 'Permanently Delete Project',
        submit: 'Delete',
        abort: 'Cancel',

        content: html`
            <li><p>Are you sure you want to <em>permanently<em> delete the project '${project.name}'?<br>
            This operation can not be undone!</p></li>
        `,
    };
}

//------------------------------------------------------------------------------
// Create File
//------------------------------------------------------------------------------
export function createFileTemplate(projectId: number): ModalTemplate {
    return {
        title: 'Create File',
        submit: 'Create File',
        abort: 'Cancel',

        content: html`
            <li>
                <label for="name">Name</label>
                <input id="name" type="text" placeholder="filename">
                <select id="type">
                    <option value="js">.js</option>
                    <option value="json">.json</option>
                    <option value="pl">.pl</option>
                    <option value="md">.md</option>
                </select>
            </li>
        `,

        init: async (shadowRoot: ShadowRoot) => {
            const name = shadowRoot.getElementById('name') as HTMLInputElement;
            const type = shadowRoot.getElementById('type') as HTMLSelectElement;
            name.value = '';
            type.selectedIndex = 0;
        },

        check: async (fields: {[key:string]: any}) => {
            if (fields.name.length === 0)
                return Error('Empty filename! Every file must have a name.');
            if (!fields.name.match(/[a-zA-Z0-9_-]/))
                return Error('Invalid character! Only numbers, letters, _ and - are allowed.');
            if (await db.fileExists(projectId, `${fields.name}.${fields.type}`))
                return Error('Duplicate name! A file with that name and ending already exists!');
            return true;
        },
    };
}

//------------------------------------------------------------------------------
// Delete File
//------------------------------------------------------------------------------
export function deleteFileTemplate(file: File): ModalTemplate {
    const type = file.projectId === 0 ? 'global' : 'project';
    return {
        title: 'Delete File',
        submit: 'Yes Delete',
        abort: 'No',

        content: html`
            <li><p>Are you sure you want to <em>permanently</em> delete the <em>${type}</em> file '${file.name}'?</p></li>`,
    };
}

//------------------------------------------------------------------------------
// Download Project
//------------------------------------------------------------------------------
export function downloadProjectTemplate(project: Project): ModalTemplate {
    return{
        title: 'Download Project',
        submit: 'Download',
        abort: 'Cancel',

        content: html`
            <li>
                <label for="name">Name</label>
                <input id="name" type="text" placeholder="name" autocomplete="off" value="${project.name}.zip">
            </li>
            <li>
                <label>Options</label>
                <ul class="options">
                    <li>
                        <label for="globals">Include global files</label>
                        <input id="globals" type="checkbox">
                    </li>
                </ul>
            </li>
        `,

        init: async (shadowRoot: ShadowRoot) => {
            const globals = shadowRoot.getElementById('globals') as HTMLInputElement;
            globals.checked = false;
        },
    }
}