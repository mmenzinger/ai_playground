import { html, unsafeCSS, css, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from 'src/store.js';
import { defer } from 'src/util.js';

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./c4f-markdown.css').toString());

const showdown = require('showdown');
const converter = new showdown.Converter();

class C4fMarkdown extends connect(store)(LitElement) {
    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    constructor() {
        super();
        this._currentFile = {
            id: 0,
            content: '',
            name: '',
            lastChange: 0,
        }
        this._currentProject = 0;
        this._markdownContainer = defer();
    }

    render() {
        return html`<div id="markdown"></div>`;
    }

    firstUpdated(){
        const container = this.shadowRoot.querySelector('#markdown');
        this._markdownContainer.resolve(container);
    }

    async stateChanged(state) {
        // clear markdown
        if(state.projects.currentProject !== this._currentProject){
            this._currentProject = state.projects.currentProject;
            const container = await this._markdownContainer;
            container.innerHTML = '';
            this._currentFile.id = 0;
        }
        // update markdown
        if (state.files.currentFile !== undefined
            && (state.files.currentFile.id !== this._currentFile.id || state.files.currentFile.lastChange !== this._currentFile.lastChange)
            && state.files.currentFile.name.endsWith('.md')) {
            this._currentFile = {...state.files.currentFile};
            const container = await this._markdownContainer;
            container.innerHTML = converter.makeHtml(this._currentFile.content);
            this.updateHyperlinks(container);
        }
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
}

window.customElements.define('c4f-markdown', C4fMarkdown);
