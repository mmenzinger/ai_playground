import { html, LitElement } from 'lit-element';
import { reaction } from 'mobx';
import projectStore from '@store/project-store';
import { Project } from '@store/types';

import Prism from 'prismjs';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/components/prism-prolog';
import 'prismjs/components/prism-markdown';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './c4f-markdown.css';
// @ts-ignore
import prism from 'prismjs/themes/prism.css';
// @ts-ignore
import prismLineNumbers from 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import db from '@localdb';

const showdown = require('showdown');
const converter = new showdown.Converter({
    ghCompatibleHeaderId: true,
    parseImgDimensions: true,
    strikethrough: true,
    tables: true,
    takslists: true,
    smoothLivePreview: true,
});

class C4fMarkdown extends LitElement {
    static get styles() {
        return [
            sharedStyles,
            style,
            prism,
            prismLineNumbers,
        ];
    }

    #activeProject: Project | null = null;

    render() {
        return html`<div id="markdown"></div>`;
    }

    firstUpdated(){
        const container = this.shadowRoot?.querySelector('#markdown') as HTMLElement;

        reaction(
            () => projectStore.activeProject,
            project => {
                if(project !== this.#activeProject){
                    this.#activeProject = project;
                    container.innerHTML = '';
                }
            }
        )
        reaction(
            () => ({
                file: projectStore.activeFile,
                content: projectStore.activeFile?.content,
            }),
            async data => {
                let {file, content} = data;
                // load readme.md or scenario.md when no md-file is selected in the beginning
                if(!file?.name.endsWith('.md') && projectStore.activeProject && container.innerHTML.length === 0){
                    const projectId = projectStore.activeProject.id;
                    for(const fileName of ['readme.md', 'scenario.md']){
                        try{
                            file = await db.loadFileByName(projectId, fileName);
                            break;
                        }
                        catch(_){}
                    }
                    if(!file?.name.endsWith('.md')){
                        const files = await db.getProjectFiles(projectId);
                        for(const pfile of files){
                            if(pfile.name.endsWith('.md')){
                                file = pfile;
                                break;
                            }
                        }
                    }
                }
                if(file?.name.endsWith('.md')){
                    container.innerHTML = converter.makeHtml(content);
                    this.updateHyperlinks(container);
                    this.updateCodeHighlight(container);
                }
            },
            {
                fireImmediately: true,
                delay: 1,
            }
        );
    }

    updateHyperlinks(element: HTMLElement){
        const anchors = element.querySelectorAll('a');
        anchors.forEach(anchor => {
            const href = anchor.getAttribute('href');
            if(href && href[0] === '#'){
                anchor.onclick = (event) => {
                    event.preventDefault();
                    const target = element.querySelector(href);
                    if(target)
                        target.scrollIntoView();
                };
            }
        });
    }

    updateCodeHighlight(element: HTMLElement){
        for(const pre of element.querySelectorAll('pre')){
            pre.classList.add('line-numbers');
        }

        Prism.highlightAllUnder(element);
    }
}

window.customElements.define('c4f-markdown', C4fMarkdown);
