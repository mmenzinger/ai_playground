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
                <h2>Basic Line</h2>
                <p>Open educational resource, AI programming playground</p>
                <h2>Privacy Policy</h2>
                <p>This website does store all its data locally inside the browser. The only time anonymous data is sent and stored on a server is when submitting a bug report. The report contains the included message, the current state of the website (opened page, active file, ...) and optionally all files inside the project.</p>
                <h2>Source Code</h2>
                <p>The source code can be found on <a href="https://gitlab.c4f.wtf/c4f.wtf/ai">GitLab</a>.</p>
            </section>
        `;
    }
}

window.customElements.define('ai-impressum', AiImpressum);
