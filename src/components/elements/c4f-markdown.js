import { html, LitElement } from 'lit-element';
import { autorun } from 'mobx';
import projectStore from 'store/project-store.js';

import Prism from 'prismjs';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/components/prism-prolog';
import 'prismjs/components/prism-markdown';

import sharedStyles from 'components/shared-styles.css';
import style from './c4f-markdown.css';
import prism from 'prismjs/themes/prism.css';
import prismLineNumbers from 'prismjs/plugins/line-numbers/prism-line-numbers.css';

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

    constructor() {
        super();
        this._activeFile = null;
        this._activeProject = null;
    }

    render() {
        return html`<div id="markdown"></div>`;
    }

    firstUpdated(){
        const container = this.shadowRoot.querySelector('#markdown');

        autorun(async reaction => {
            // clear markdown
            const project = projectStore.activeProject;
            const file = projectStore.activeFile;
            if(project !== this._activeProject){
                this._activeProject = project;
                container.innerHTML = '';
                this._activeFile = null;
            }
            // update markdown
            if (file && file.name.endsWith('.md')) {
                this._activeFile = file;
                container.innerHTML = converter.makeHtml(file.content);
                this.updateHyperlinks(container);
                this.updateCodeHighlight(container);
            }
        });
    }

    updateHyperlinks(element){
        const anchors = element.querySelectorAll('a');
        anchors.forEach(anchor => {
            const href = anchor.getAttribute('href');
            if(href[0] === '#'){
                anchor.onclick = (event) => {
                    event.preventDefault();
                    const target = element.querySelector(href);
                    if(target)
                        target.scrollIntoView();
                };
            }
        });
    }

    updateCodeHighlight(element){
        for(const pre of element.querySelectorAll('pre')){
            pre.classList.add('line-numbers');
        }

        Prism.highlightAllUnder(element);
    }
}

window.customElements.define('c4f-markdown', C4fMarkdown);
