import { LitElement, html, unsafeCSS } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';
import { installRouter } from 'pwa-helpers/router.js';
import { installOfflineWatcher } from 'pwa-helpers/network.js';

import { navigate, updateOffline } from 'actions/app.js';

import('components/elements/ai-header.js');
import('components/elements/c4f-modal.js');

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./ai-app.css').toString());


class AiApp extends connect(store)(LitElement) {
    static get properties() {
        return {
            _page: { type: String },
        };
    }

    static get styles() {
        return [
            sharedStyles,
            style
        ];
    }

    render() {
        return html`
            <c4f-modal></c4f-modal>
            <header>
                <ai-header title="AI Playground"></ai-header>
            </header>
            <main>
                <ai-project class="page" ?active="${this._page === 'project'}"></ai-project>
                <ai-project-index class="page" ?active="${this._page === 'index'}"></ai-project-index>
            </main>
        `;
    }

    firstUpdated() {
        installRouter(location => store.dispatch(navigate(decodeURIComponent(location.pathname), location.search)));
        installOfflineWatcher(offline => store.dispatch(updateOffline(offline)));
    }

    stateChanged(state) {
        this._page = state.app.page;
    }
}

window.customElements.define('ai-app', AiApp);
