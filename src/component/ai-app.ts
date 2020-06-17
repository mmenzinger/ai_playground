import { html } from 'lit-element';
import { installRouter } from 'pwa-helpers/router.js';
import { installOfflineWatcher } from 'pwa-helpers/network.js';
import appStore from '@store/app-store';
import { MobxLitElement } from '@adobe/lit-mobx';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './ai-app.css';

// import { debugProjectStore } from '@store/project-store';
// import { debugAppStore } from '@store/app-store';
// import { debugSettingsStore } from '@store/settings-store';
// debugProjectStore();
// debugAppStore();
// debugSettingsStore();

import('@element/ai-header');
import('@element/c4f-modal');
import('@element/c4f-bug-tracker');



class AiApp extends MobxLitElement {
    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    render() {
        return html`
            <c4f-modal></c4f-modal>
            <c4f-bug-tracker id="report"></c4f-bug-tracker>
            <header>
                <ai-header title="AI Playground"></ai-header>
            </header>
            <main>
                <ai-404 class="page" ?active="${appStore.page === '404'}"></ai-404>
                <ai-news class="page" ?active="${appStore.page === 'news'}"></ai-news>
                <ai-impressum class="page" ?active="${appStore.page === 'impressum'}"></ai-impressum>
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
