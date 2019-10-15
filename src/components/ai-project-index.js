import { html, unsafeCSS } from 'lit-element';
import { PageElement } from 'classes/page-element.js';

const sharedStyles = unsafeCSS(require('./shared-styles.css').toString());
//const style = unsafeCSS(require('./ai-project-index.css').toString());

class AiProjectIndex extends PageElement {

    static get styles() {
        return [
            sharedStyles,
            //style
        ];
    }

    render() {
        return html`
            <h1>Index</h1>
            <a href="project">Go to project</a>
        `;
    }
}

window.customElements.define('ai-project-index', AiProjectIndex);
