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
            <form>
                <select id="template">${options}</select>
                <input id="name" type="text" placeholder="Name" autocomplete="off" value="${templates[0].name}">
            </form>`,
    
        check: async (fields) => {
            if(fields.name.length === 0)
                return Error('Empty project name! Every project must have a name.');
            const project = await db.getProjectByName(fields.name);
            if(project !== undefined)
                return Error('Duplicate name! A project with that name already exists!');
        },
    
        change: {
            template: (e, that) => {
                const text = e.target.options[e.target.selectedIndex].innerHTML.replace(/<!---->/g, '').trim();
                that.shadowRoot.querySelector('#name').value = text;
            }
        }
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
            <form>
                <select id="example">${options}</select>
                <input id="name" type="text" placeholder="name" value="${examples[0].name}">
            </form>`,
        
        check: async (fields) => {
            if(fields.name.length === 0)
                return Error('Empty project name! Every project must have a name.');
            const project = await db.getProjectByName(fields.name);
            if(project !== undefined)
                return Error('Duplicate name! A project with that name already exists!');
        },

        change: {
            example: (e, that) => {
                const text = e.target.options[e.target.selectedIndex].innerHTML.replace(/<!---->/g, '').trim();
                that.shadowRoot.querySelector('#name').value = text;
            }
        }
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
            <p>Are you sure you want to <em>permanently<em> delete the project '${project.name}'?<br>
            This operation can not be undone!</p>`,
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
            <form>
                <input id="name" type="text" placeholder="filename">
                <select id="type">
                    <option value="js">.js</option>
                    <option value="json">.json</option>
                    <option value="pl">.pl</option>
                    <option value="md">.md</option>
                </select>
            </form>
        `,

        check: async (fields) => {
            if (fields.name.length === 0)
                return Error('Empty filename! Every file must have a name.');
            if (!fields.name.match(/[a-zA-Z0-9_-]/))
                return Error('Invalid character! Only numbers, letters, _ and - are allowed.');
            const file = await db.loadFileByName(project, `${fields.name}.${fields.type}`);
            if (file !== undefined)
                return Error('Duplicate name! A file with that name and ending already exists!');
        }
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

        content: html`<p>Are you sure you want to <em>permanently</em> delete the <em>${project}</em>-file '${file.name}'?</p>`,
    };
}