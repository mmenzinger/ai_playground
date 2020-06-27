import { html } from 'lit-element';
import db from '@localdb';
import { ScenarioTemplates } from '@src/webpack-utils';
import { Project, File } from '@store/types';
import { ModalTemplate } from '@modal/modal-generic';
import JSZip from 'jszip';

//------------------------------------------------------------------------------
// New Project
//------------------------------------------------------------------------------
export function newProjectTemplate(scenarioTemplates: { [key: string]: ScenarioTemplates }): ModalTemplate {
    const scenarios = Object.values(scenarioTemplates).map(scenario => html`<option value="${scenario.name}">${Object.values(scenario.templates)[0].name}</option>`);
    const firstScenario = Object.values(scenarioTemplates)[0];
    const firstTemplate = Object.values(firstScenario.templates)[0];

    let selectedScenarioIndex = 1;
    let selectedTemplateIndex = 0;

    function updateTemplates(templateSelect: HTMLSelectElement, scenario: string) {
        const templates = Object.entries(scenarioTemplates[scenario].templates).map(([key, _]) => `<option value="${key}">Default</option>`).join('');
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

        check: async (fields: { [key: string]: any }) => {
            if (fields.name.length === 0)
                return Error('Empty project name!<br>Every project must have a name.');
            if (await db.projectExists(fields.name))
                return Error('Duplicate name!<br>A project with the same name already exists.');
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
// Upload Project
//------------------------------------------------------------------------------
export function uploadProjectTemplate(): ModalTemplate {
    let zip: JSZip;
    let settings: Project;
    let projectFiles: File[];
    let globalFiles: File[];

    async function onSelectFile(fileSelectElement: HTMLInputElement, nameElement: HTMLInputElement) {
        const zipFile: string = await new Promise((resolve, _) => {
            const reader = new FileReader();
            // @ts-ignore - it will throw an exception if null
            reader.onload = () => resolve(reader.result);
            // @ts-ignore - it will throw an exception if null
            reader.readAsArrayBuffer((fileSelectElement.files)[0]);
        });
        zip = await JSZip.loadAsync(zipFile);
        settings = JSON.parse(await zip.file('settings.json').async('text'));
        nameElement.value = settings.name;
    }

    return {
        title: 'Upload Project',
        submit: 'Upload',
        abort: 'Cancel',

        content: html`
            <li>
                <label for="file">File</label>
                <input id="file" type="file">
            </li>
            <li>
                <label for="name">Name</label>
                <input id="name" type="text" placeholder="My Project">
            </li>
            <li>
                <label>Options</label>
                <ul class="options">
                    <li>
                        <label for="globals">Include global files</label>
                        <input id="globals" type="checkbox">
                    </li>
                    <li id="collision" style="display:none">
                        <ul class="options">
                            <li>
                                <label for="prefer_old">Skip existing files</label>
                                <input id="prefer_old" type="radio" name="collision" value="old" checked>
                            </li>
                            <li>
                                <label for="prefer_new">Overwrite existing files</label>
                                <input id="prefer_new" type="radio" name="collision" value="new">
                            </li>
                        </ul>
                    </li>
                </ul>
            </li>
        `,

        init: async (shadowRoot: ShadowRoot) => {
            const prefer_old = shadowRoot.getElementById('prefer_old') as HTMLInputElement;
            const prefer_new = shadowRoot.getElementById('prefer_new') as HTMLInputElement;
            const collision = shadowRoot.getElementById('collision') as HTMLLIElement;
            const globals = shadowRoot.getElementById('globals') as HTMLInputElement;
            const name = shadowRoot.getElementById('name') as HTMLInputElement;
            const file = shadowRoot.getElementById('file') as HTMLInputElement;
            prefer_new.checked = false;
            prefer_old.checked = true;
            collision.style.display = 'none';
            globals.checked = false;
            name.value = '';
            file.value = '';
        },

        check: async (fields: { [key: string]: any }) => {
            try {
                const globals = fields.globals as boolean;
                const name = fields.name as string;

                const projectFilesPromises: Promise<File>[] = [];
                zip.folder('project').forEach((filename, file) => {
                    projectFilesPromises.push(new Promise((resolve, _) => {
                        let filetype: 'text'|'blob' = 'text';
                        if(/\.(png|jpe?g)$/.test(file.name)){
                            filetype = 'blob';
                        }
                        file.async(filetype).then(content => {
                            resolve({
                                id: 0,
                                projectId: 0,
                                name: filename,
                                content,
                            });
                        });
                    }));
                });

                const globalFilesPromises: Promise<File>[] = [];
                if (globals) {
                    zip.folder('global').forEach((filename, file) => {
                        globalFilesPromises.push(new Promise((resolve, _) => {
                            let filetype: 'text'|'blob' = 'text';
                            if(/\.(png|jpe?g)$/.test(file.name)){
                                filetype = 'blob';
                            }
                            file.async(filetype).then(content => {
                                resolve({
                                    id: 0,
                                    projectId: 0,
                                    name: filename,
                                    content,
                                });
                            });
                        }));
                    });
                }
                if (name.length === 0)
                    throw Error('Empty project name!<br>Every project must have a name.');
                if (await db.projectExists(name))
                    throw Error('Duplicate name!<br>A project with the same name already exists.');

                projectFiles = await Promise.all(projectFilesPromises);
                globalFiles = await Promise.all(globalFilesPromises);
            }
            catch (error) {
                return error;
            }
            return true;
        },

        async result(shadowRoot: ShadowRoot) {
            const prefer_new = shadowRoot.getElementById('prefer_new') as HTMLInputElement;
            const prefer_old = shadowRoot.getElementById('prefer_old') as HTMLInputElement;
            const collision = (prefer_new.checked ? prefer_new.value : prefer_old.value);
            const name = shadowRoot.getElementById('name') as HTMLInputElement;
            return {
                projectFiles,
                globalFiles,
                name: name.value,
                collision: collision,
                settings,
            }
        },

        change: {
            file: (event: Event, shadowRoot: ShadowRoot) => {
                const name = shadowRoot.getElementById('name') as HTMLInputElement;
                onSelectFile(event.target as HTMLInputElement, name);
            },
            globals: (event: Event, shadowRoot: ShadowRoot) => {
                const collision = shadowRoot.getElementById('collision') as HTMLLIElement;
                const display = (event.target as HTMLInputElement).checked ? 'block' : 'none';
                collision.style.display = display;
            }
        },
    };
}


//------------------------------------------------------------------------------
// Download Project
//------------------------------------------------------------------------------
export function downloadProjectTemplate(project: Project): ModalTemplate {
    return {
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
                <label for="projectId">Visibility</label>
                <select id="projectId">
                    <option value="${projectId}">Project</option>
                    <option value="0">Global</option>
                </select>
            </li>
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
            const visibility = shadowRoot.getElementById('projectId') as HTMLSelectElement;
            name.value = '';
            type.selectedIndex = 0;
            visibility.selectedIndex = 0;
        },

        check: async (fields: { [key: string]: any }) => {
            const project = Number(fields.projectId);
            if (fields.name.length === 0)
                return Error('Empty filename!<br>Every file must have a name.');
            if (!fields.name.match(/^[a-zA-Z0-9_-]+$/))
                return Error('Invalid character!<br>Only numbers, letters, _ and - are allowed.');
            if (await db.fileExists(project, `${fields.name}.${fields.type}`))
                return Error('Duplicate name!<br>A file with the same name and ending already exists.');
            return true;
        },
    };
}

//------------------------------------------------------------------------------
// Upload File
//------------------------------------------------------------------------------
export function uploadFileTemplate(projectId: number): ModalTemplate {
    let file: {
        name: string,
        content: string | Blob,
        projectId: Number,
    };

    async function onSelectFile(fileSelectElement: HTMLInputElement, nameElement: HTMLInputElement, typeElement: HTMLSelectElement) {
        // @ts-ignore - it will throw an exception if null
        const selectedFile = (fileSelectElement.files)[0];
        const name = selectedFile.name;
        const content: string | Blob = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if(reader.result instanceof ArrayBuffer){
                    resolve(new Blob([reader.result]));
                }
                else if(typeof reader.result === 'string'){
                    resolve(reader.result);
                }
                else{
                    reject('invalid file');
                }
            };
            if(/\.(png|jpe?g)$/.test(name)){
                reader.readAsArrayBuffer(selectedFile);
            }
            else if(/\.(js|pl|json|md)$/.test(name)){
                reader.readAsText(selectedFile);
            }
            else{
                reject('invalid file type');
            }
        });

        const [filename, ending] = name.split('.');
        nameElement.value = filename;
        [...typeElement.options].some((option, index) => {
            if (option.value == ending) {
                typeElement.selectedIndex = index;
                return true;
            }
            return false;
        });
        file = {
            name,
            content,
            projectId,
        }
    }

    return {
        title: 'Upload File',
        submit: 'Upload',
        abort: 'Cancel',

        content: html`
            <li>
                <label for="file">File</label>
                <input id="file" type="file">
            </li>
            <li>
                <label for="projectId">Visibility</label>
                <select id="projectId">
                    <option value="${projectId}">Project</option>
                    <option value="0">Global</option>
                </select>
            </li>
            <li>
                <label for="name">Name</label>
                <input id="name" type="text" placeholder="filename">
                <select id="type">
                    <option value="js">.js</option>
                    <option value="json">.json</option>
                    <option value="pl">.pl</option>
                    <option value="md">.md</option>
                    <option value="png">.png</option>
                    <option value="jpg">.jpg</option>
                </select>
            </li>
        `,

        init: async (shadowRoot: ShadowRoot) => {
            const file = shadowRoot.getElementById('file') as HTMLInputElement;
            const name = shadowRoot.getElementById('name') as HTMLInputElement;
            const type = shadowRoot.getElementById('type') as HTMLSelectElement;
            const visibility = shadowRoot.getElementById('projectId') as HTMLSelectElement;
            file.value = '';
            name.value = '';
            type.selectedIndex = 0;
            visibility.selectedIndex = 0;
        },

        check: async (fields: { [key: string]: any }) => {
            const project = Number(fields.projectId);
            const filename = `${fields.name}.${fields.type}`;
            if (fields.name.length === 0)
                return Error('Empty filename!<br>Every file must have a name.');
            if (!fields.name.match(/^[a-zA-Z0-9_-]+$/))
                return Error('Invalid character!<br>Only numbers, letters, _ and - are allowed.');
            if (await db.fileExists(project, filename))
                return Error('Duplicate name!<br>A file with the same name and ending already exists.');
            file.projectId = project;
            file.name = filename;
            return true;
        },

        async result(shadowRoot: ShadowRoot) {
            return {
                ...file,
            }
        },

        change: {
            file: (event: Event, shadowRoot: ShadowRoot) => {
                const name = shadowRoot.getElementById('name') as HTMLInputElement;
                const type = shadowRoot.getElementById('type') as HTMLSelectElement;
                onSelectFile(event.target as HTMLInputElement, name, type);
            },
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
