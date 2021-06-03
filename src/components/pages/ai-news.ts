import { html } from 'lit-element';
import { LazyElement } from '@element/lazy-element';
import settingsStore from '@store/settings-store';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './ai-news.css';

import welcome from '@page/news/welcome';
import update_2020_07_11 from '@page/news/update_2020_07_11';
import update_2020_10_12 from '@page/news/update_2020_10_12';

export const NEWS_VERSION = 3;

const NEWS = {
    1: welcome,
    2: update_2020_07_11,
    3: update_2020_10_12,
}

class AiNews extends LazyElement {
    static get properties() {
        return {
            ...super.properties,
            _skip: { type: Boolean },
        };
    }

    static get styles() {
        return [
            sharedStyles,
            style
        ];
    }

    _skip = false;

    render() {
        const old_version = settingsStore.get('news_version') || 0;
        const active_news = [];
        for(const [version, content] of Object.entries(NEWS)){
            if((Number(version) > old_version && Number(version) <= NEWS_VERSION)
            || Number(version) === old_version && old_version === NEWS_VERSION){
                active_news.push(content);
            }
        }
        return html`
            <section id="news">
                ${active_news}
            </section>
            <footer>
                <p><button @click=${this.onContinue} class="ok">Continue</button></p>
            </footer>
        `;
    }

    async onContinue() {
        settingsStore.set('news_version', NEWS_VERSION);
        location.href = '#projects';
    }

    firstUpdated() {

    }
}

window.customElements.define('ai-news', AiNews);
