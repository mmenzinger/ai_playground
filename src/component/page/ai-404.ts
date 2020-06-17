import { html } from 'lit-element';
import { LazyElement } from '@element/lazy-element';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './ai-404.css';

class Ai404 extends LazyElement {
    static get styles() {
        return [
            sharedStyles,
            style
        ];
    }

    render() {
        return html`
            <section>
                <h1>Oops...</h1>
                <p>The page you are requesting does not exist. Please use the menu for navigation.</p>
                <p>If you think this is a bug, you can look at the warning inside the developer console and file a bug-report.</p>
            </section>
        `;
    }
}

window.customElements.define('ai-404', Ai404);
