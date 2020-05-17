import { html, TemplateResult } from 'lit-element';
import db from '@localdb';
import { ScenarioTemplate } from '@src/webpack-utils';
import { Project, File } from '@store/types';

export type ModalTemplate = {
    title: string,
    submit: string,
    abort: string,
    content: TemplateResult,
    init: (root: ShadowRoot) => Promise<void>;
    change: () => Promise<void>;
    check: (fields: {[key:string]: any}) => Promise<Error | true>;
};

//------------------------------------------------------------------------------
// New Project
//------------------------------------------------------------------------------
export function newProjectTemplate(templates: ScenarioTemplate[]) {
    const options = [];
    for(let i = 0; i < templates.length; i++){
        options.push(html`<option value="${i}">${templates[i].name}</option>`);
    }

    return {
        title: 'New Project',
        submit: 'Create',
        abort: 'Cancel',
    
        content: html`
            <li>
                <label for="template">Scenario</label>
                <select id="template">${options}</select>
            </li>
            <li>
                <label for="name">Name</label>
                <input id="name" type="text" placeholder="My Project" value="${templates[0].name}">
            </li>
        `,
        
        init: async (shadowRoot: ShadowRoot) => {
            const template = shadowRoot.getElementById('template') as HTMLSelectElement;
            const name = shadowRoot.getElementById('name') as HTMLInputElement;
            template.selectedIndex = 0;
            name.value = template.options[0].innerHTML.replace(/<!---->/g, '').trim();
        },
    
        check: async (fields: {[key:string]: any}) => {
            if(fields.name.length === 0)
                return Error('Empty project name! Every project must have a name.');
            if(await db.projectExists(fields.name))
                return Error('Duplicate name! A project with that name already exists!');
            return true;
        },
    
        change: {
            template: (e: Event, shadowRoot: ShadowRoot) => {
                const target = e.target as HTMLSelectElement; 
                const text = target.options[target.selectedIndex].innerHTML.replace(/<!---->/g, '').trim();
                const name = shadowRoot.getElementById('name') as HTMLInputElement;
                name.value = text;
            }
        },
    };
}

//------------------------------------------------------------------------------
// New Example
//------------------------------------------------------------------------------
export function newExampleTemplate(examples: ScenarioTemplate[]) {
    const options = [];
    for(let i = 0; i < examples.length; i++){
        options.push(html`<option value="${i}">${examples[i].name}</option>`);
    }
    
    return{
        title: 'Load Example',
        submit: 'Create',
        abort: 'Cancel',

        content: html`
            <li>
                <label for="example">Example</label>
                <select id="example">${options}</select>
            </li>
            <li>
                <label for="name">Name</label>
                <input id="name" type="text" placeholder="My Project" value="${examples[0].name}">
            </li>
        `,
        
        init: async (shadowRoot: ShadowRoot) => {
            const template = shadowRoot.getElementById('example') as HTMLSelectElement;
            template.selectedIndex = 0;
            const name = shadowRoot.getElementById('name') as HTMLInputElement;
            name.value = template.options[0].innerHTML.replace(/<!---->/g, '').trim();
        },
        
        check: async (fields: {[key:string]: any}) => {
            if(fields.name.length === 0)
                return Error('Empty project name! Every project must have a name.');
            if(await db.projectExists(fields.name))
                return Error('Duplicate name! A project with that name already exists!');
            return true;
        },

        change: {
            example: (e: Event, shadowRoot: ShadowRoot) => {
                const target = e.target as HTMLSelectElement; 
                const text = target.options[target.selectedIndex].innerHTML.replace(/<!---->/g, '').trim();
                const name = shadowRoot.getElementById('name') as HTMLInputElement;
                name.value = text;
            }
        },
    }
}

//------------------------------------------------------------------------------
// Delete Project
//------------------------------------------------------------------------------
export function deleteProjectTemplate(project: Project) {
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
export function createFileTemplate(projectId: number){
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
export function deleteFileTemplate(file: File){
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
export function downloadProjectTemplate(project: Project) {
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