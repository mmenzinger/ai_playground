import React, { useState } from 'react';

// export function uploadProjectTemplate(): ModalTemplate {
//     let zip: JSZip;
//     let settings: Project;
//     let projectFiles: File[];
//     let globalFiles: File[];

//     async function onSelectFile(
//         fileSelectElement: HTMLInputElement,
//         nameElement: HTMLInputElement
//     ) {
//         const zipFile: string = await new Promise((resolve, _) => {
//             const reader = new FileReader();
//             // @ts-ignore - it will throw an exception if null
//             reader.onload = () => resolve(reader.result);
//             // @ts-ignore - it will throw an exception if null
//             reader.readAsArrayBuffer(fileSelectElement.files[0]);
//         });
//         zip = await JSZip.loadAsync(zipFile);
//         settings = JSON.parse(
//             (await zip.file('settings.json')?.async('text')) || ''
//         );
//         nameElement.value = settings.name;
//     }

//     return {
//         title: 'Upload Project',
//         submit: 'Upload',
//         abort: 'Cancel',

//         content: html`
//             <li>
//                 <label for="file">File</label>
//                 <input id="file" type="file" />
//             </li>
//             <li>
//                 <label for="name">Name</label>
//                 <input id="name" type="text" placeholder="My Project" />
//             </li>
//             <li>
//                 <label>Options</label>
//                 <ul class="options">
//                     <li>
//                         <label for="globals">Include global files</label>
//                         <input id="globals" type="checkbox" />
//                     </li>
//                     <li id="collision" style="display:none">
//                         <ul class="options">
//                             <li>
//                                 <label for="prefer_old"
//                                     >Skip existing files</label
//                                 >
//                                 <input
//                                     id="prefer_old"
//                                     type="radio"
//                                     name="collision"
//                                     value="old"
//                                     checked
//                                 />
//                             </li>
//                             <li>
//                                 <label for="prefer_new"
//                                     >Overwrite existing files</label
//                                 >
//                                 <input
//                                     id="prefer_new"
//                                     type="radio"
//                                     name="collision"
//                                     value="new"
//                                 />
//                             </li>
//                         </ul>
//                     </li>
//                 </ul>
//             </li>
//         `,

//         init: async (shadowRoot: ShadowRoot) => {
//             const prefer_old = shadowRoot.getElementById(
//                 'prefer_old'
//             ) as HTMLInputElement;
//             const prefer_new = shadowRoot.getElementById(
//                 'prefer_new'
//             ) as HTMLInputElement;
//             const collision = shadowRoot.getElementById(
//                 'collision'
//             ) as HTMLLIElement;
//             const globals = shadowRoot.getElementById(
//                 'globals'
//             ) as HTMLInputElement;
//             const name = shadowRoot.getElementById('name') as HTMLInputElement;
//             const file = shadowRoot.getElementById('file') as HTMLInputElement;
//             prefer_new.checked = false;
//             prefer_old.checked = true;
//             collision.style.display = 'none';
//             globals.checked = false;
//             name.value = '';
//             file.value = '';
//         },

//         check: async (fields: { [key: string]: any }) => {
//             try {
//                 const globals = fields.globals as boolean;
//                 const name = fields.name as string;

//                 const projectFilesPromises: Promise<File>[] = [];
//                 zip.folder('project')?.forEach((filename, file) => {
//                     projectFilesPromises.push(
//                         new Promise((resolve, _) => {
//                             let filetype: 'text' | 'blob' = 'text';
//                             if (/\.(png|jpe?g)$/.test(file.name)) {
//                                 filetype = 'blob';
//                             }
//                             file.async(filetype).then((content) => {
//                                 resolve({
//                                     id: 0,
//                                     projectId: 0,
//                                     name: filename,
//                                     content,
//                                 });
//                             });
//                         })
//                     );
//                 });

//                 const globalFilesPromises: Promise<File>[] = [];
//                 if (globals) {
//                     zip.folder('global')?.forEach((filename, file) => {
//                         globalFilesPromises.push(
//                             new Promise((resolve, _) => {
//                                 let filetype: 'text' | 'blob' = 'text';
//                                 if (/\.(png|jpe?g)$/.test(file.name)) {
//                                     filetype = 'blob';
//                                 }
//                                 file.async(filetype).then((content) => {
//                                     resolve({
//                                         id: 0,
//                                         projectId: 0,
//                                         name: filename,
//                                         content,
//                                     });
//                                 });
//                             })
//                         );
//                     });
//                 }
//                 if (name.length === 0)
//                     throw Error(
//                         'Empty project name!<br>Every project must have a name.'
//                     );
//                 if (await db.projectExists(name))
//                     throw Error(
//                         'Duplicate name!<br>A project with the same name already exists.'
//                     );

//                 projectFiles = await Promise.all(projectFilesPromises);
//                 globalFiles = await Promise.all(globalFilesPromises);
//             } catch (error) {
//                 return error;
//             }
//             return true;
//         },

//         async result(shadowRoot: ShadowRoot) {
//             const prefer_new = shadowRoot.getElementById(
//                 'prefer_new'
//             ) as HTMLInputElement;
//             const prefer_old = shadowRoot.getElementById(
//                 'prefer_old'
//             ) as HTMLInputElement;
//             const collision = prefer_new.checked
//                 ? prefer_new.value
//                 : prefer_old.value;
//             const name = shadowRoot.getElementById('name') as HTMLInputElement;
//             return {
//                 projectFiles,
//                 globalFiles,
//                 name: name.value,
//                 collision: collision,
//                 settings,
//             };
//         },

//         change: {
//             file: (event: Event, shadowRoot: ShadowRoot) => {
//                 const name = shadowRoot.getElementById(
//                     'name'
//                 ) as HTMLInputElement;
//                 onSelectFile(event.target as HTMLInputElement, name);
//             },
//             globals: (event: Event, shadowRoot: ShadowRoot) => {
//                 const collision = shadowRoot.getElementById(
//                     'collision'
//                 ) as HTMLLIElement;
//                 const display = (event.target as HTMLInputElement).checked
//                     ? 'block'
//                     : 'none';
//                 collision.style.display = display;
//             },
//         },
//     };
// }
