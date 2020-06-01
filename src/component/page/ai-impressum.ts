import { html } from 'lit-element';
import { LazyElement } from '@element/lazy-element';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './ai-impressum.css';

class AiImpressum extends LazyElement {
    static get styles() {
        return [
            sharedStyles,
            style
        ];
    }

    render() {
        return html`
            <section>
                <h1>Impressum</h1>
                <h2>Media Owner</h2>
                <p>Manuel Menzinger, Laßnitzhöhe, Austria</p>
                <h2>Objects</h2>
                <p>Free educational resource</p>
            </section>
        `;
    }
}

window.customElements.define('ai-impressum', AiImpressum);
