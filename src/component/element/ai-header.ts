import { html } from 'lit-element';

import { MobxLitElement } from '@adobe/lit-mobx';
import appStore from '@store/app-store';
import projectStore from '@store/project-store';

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
        for(const [key, value] of appStore.params){
            breadcrumbs.push(html`<li>></li><li><a href="#${key}${value ? '=' + value : ''}">${projectStore.activeProject?.name || key}</a></li>`);
        }
        return html`
            <header>
                <img src="assets/logo.png" alt="Coding4Fun" class="logo">
                <a href="/">
                    <h1>${this.title}</h1>
                </a>
            </header>
            <nav>
                <ul id="breadcrumbs">${breadcrumbs}</ul>
                <ul id="additional">
                    <li><a href="https://docs.google.com/forms/d/e/1FAIpQLSfrFYo0PnULmqOhQY4bxE_uWwe21m-RtxmboGFRlJW9Or5r4w/viewform?usp=sf_link">Feedback</a></li>
                    <li><a href="https://www.eduvidual.at/course/view.php?id=23313">Community</a></li>
                    <li><a href="#impressum">Impressum</a></li>
                </ul>
            </nav>
            <img id="offline" ?active="${appStore.offline}" src="assets/interface/connect.svg" title="you are currently offline">
        `;
    }
}

window.customElements.define('ai-header', AiHeader);
