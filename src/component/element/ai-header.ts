import { html } from 'lit-element';

import { MobxLitElement } from '@adobe/lit-mobx';
import appStore from '@store/app-store';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './ai-header.css';

class AiHeader extends MobxLitElement {
    static get properties() {
        return {
            title: { type: String },
        };
    }

    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    render() {
        const breadcrumbs = [html`<li><a href="./">Home</a></li>`];
        for(const [key, value] of Object.entries(appStore.params)){
            breadcrumbs.push(html`<li>></li><li><a href="?${key}${value ? '=' + value : ''}">${key}</a></li>`);
        }
        return html`
            <header>
                <img src="assets/logo.png" alt="Coding4Fun" class="logo">
                <a href="/">
                    <h1>${this.title}</h1>
                </a>
                <div id="offline_status" ?active="${appStore.offline}">You are currently offline!</div>
                <div id="menu">
                    <ul id="breadcrumbs">${breadcrumbs}</ul>
                    <ul id="additional">
                        <li><a href="https://gitlab.c4f.wtf/c4f.wtf/ai">Code</a></li>
                        <li><a href="https://docs.google.com/forms/d/e/1FAIpQLSfrFYo0PnULmqOhQY4bxE_uWwe21m-RtxmboGFRlJW9Or5r4w/viewform?usp=sf_link">Feedback</a></li>
                        <li><a href="?impressum">Impressum</a></li>
                    </ul>
                </div>
            </header>
        `;
    }
}

window.customElements.define('ai-header', AiHeader);
