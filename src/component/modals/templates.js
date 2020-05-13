import { html } from 'lit-element';
import db from 'src/localdb.js';

//------------------------------------------------------------------------------
// New Project
//------------------------------------------------------------------------------
export function newProjectTemplate(templates) {
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
        
        init: async (shadowRoot) => {
            const template = shadowRoot.getElementById('template');
            template.selectedIndex = 0;
            shadowRoot.getElementById('name').value = template.options[0].innerHTML.replace(/<!---->/g, '').trim();
        },
    
        check: async (fields) => {
            if(fields.name.length === 0)
                return Error('Empty project name! Every project must have a name.');
            if(await db.projectExists(fields.name))
                return Error('Duplicate name! A project with that name already exists!');
        },
    
        change: {
            template: (e, shadowRoot) => {
                const text = e.target.options[e.target.selectedIndex].innerHTML.replace(/<!---->/g, '').trim();
                shadowRoot.querySelector('#name').value = text;
            }
        },
    };
}

//------------------------------------------------------------------------------
// New Example
//------------------------------------------------------------------------------
export function newExampleTemplate(examples) {
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
        
        init: async (shadowRoot) => {
            const template = shadowRoot.getElementById('example');
            template.selectedIndex = 0;
            shadowRoot.getElementById('name').value = template.options[0].innerHTML.replace(/<!---->/g, '').trim();
        },
        
        check: async (fields) => {
            if(fields.name.length === 0)
                return Error('Empty project name! Every project must have a name.');
            if(await db.projectExists(fields.name))
                return Error('Duplicate name! A project with that name already exists!');
        },

        change: {
            example: (e, shadowRoot) => {
                const text = e.target.options[e.target.selectedIndex].innerHTML.replace(/<!---->/g, '').trim();
                shadowRoot.querySelector('#name').value = text;
            }
        },
    }
}

//------------------------------------------------------------------------------
// Delete Project
//------------------------------------------------------------------------------
export function deleteProjectTemplate(project) {
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
export function createFileTemplate(project){
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

        init: async (shadowRoot) => {
            shadowRoot.getElementById('name').value = '';
            shadowRoot.getElementById('type').selectedIndex = 0;
        },

        check: async (fields) => {
            if (fields.name.length === 0)
                return Error('Empty filename! Every file must have a name.');
            if (!fields.name.match(/[a-zA-Z0-9_-]/))
                return Error('Invalid character! Only numbers, letters, _ and - are allowed.');
            if (await db.fileExists(project, `${fields.name}.${fields.type}`))
                return Error('Duplicate name! A file with that name and ending already exists!');
        },
    };
}

//------------------------------------------------------------------------------
// Delete File
//------------------------------------------------------------------------------
export function deleteFileTemplate(file){
    const project = file.project === 0 ? 'global' : 'project';
    return {
        title: 'Delete File',
        submit: 'Yes Delete',
        abort: 'No',

        content: html`
            <li><p>Are you sure you want to <em>permanently</em> delete the <em>${project}</em>-file '${file.name}'?</p></li>`,
    };
}

//------------------------------------------------------------------------------
// Download Project
//------------------------------------------------------------------------------
export function downloadProjectTemplate(project) {
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

        init: async (shadowRoot) => {
            console.log("now");
            const globals = shadowRoot.getElementById('globals');
            globals.checked = false;
        },
    }
}