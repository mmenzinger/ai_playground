import { LitElement, html, unsafeCSS } from 'lit-element';
import { installRouter } from 'pwa-helpers/router.js';
import { installOfflineWatcher } from 'pwa-helpers/network.js';
import appStore from 'store/app-store.js';
import { MobxLitElement } from '@adobe/lit-mobx';

import { debugProjectStore } from 'store/project-store.js';
import { debugAppStore } from 'store/app-store.js';
import { debugSettingsStore } from 'store/settings-store.js';
debugProjectStore();
debugAppStore();
debugSettingsStore();

import('elements/ai-header.js');
import('elements/c4f-modal.js');

const sharedStyles = unsafeCSS(require('components/shared-styles.css').toString());
const style = unsafeCSS(require('./ai-app.css').toString());


class AiApp extends MobxLitElement {
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
                <ai-welcome class="page" ?active="${appStore.page === 'welcome'}"></ai-welcome>
                <ai-project class="page" ?active="${appStore.page === 'project'}"></ai-project>
                <ai-project-index class="page" ?active="${appStore.page === 'projects'}"></ai-project-index>
            </main>
        `;
    }

    firstUpdated() {
        installRouter(location => appStore.navigate(decodeURIComponent(location.pathname), location.search));
        installOfflineWatcher(offline => appStore.updateOfflineStatus(offline));
    }
}

window.customElements.define('ai-app', AiApp);
