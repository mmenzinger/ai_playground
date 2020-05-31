import { html } from 'lit-element';
import { LazyElement } from '@element/lazy-element';
import settingsStore from '@store/settings-store';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './ai-welcome.css';

class AiWelcome extends LazyElement {
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
        return html`
            <section>
                <h1>Welcome to ai.c4f.wtf</h1>
                <p>This website is a new platform for teaching and experimenting with ai techniques on various scenarios. It enables the user to focus on solving the task ahead by providing a complete programming environment inside the browser as well as engaging scenarios to try someones skills.<br>The goal was not to teach specific algorithms or techniques, for which you can find many examples online, but to provide an easy to use, no setup required, ai development environment, where you can just try out the algorithms you learned previously on different scenarios.</p>
                <p>This project is part of my masters-thesis and i would be very thankful when i could get some feedback using <a href="">this questionnaire</a>.<br>Furthermore the app is open-source and its code can be found <a href="https://gitlab.c4f.wtf/c4f.wtf/ai">here on gitlab</a>. It was created with extensibility in mind, any contributions (especially new scenarios) are very welcome.</p>
                <p>For security and privacy reasons, everything you do only happens locally on your computer. If you want to transfer your project to another machine simply export it and then import it on your target.</p>
                <p>This page is under heavy development, scenarios might change and bugs may occur. To help fixing those problems please make use of the report function in the top right corner.</p>
            </section>
            <footer>
                <p>
                    <input type="checkbox" id="skip">
                    <label for="skip">Don't show next time.</label>
                </p>
                <button @click=${this.onContinue} class="ok">Continue</button>
            </footer>
        `;
    }

    async onContinue() {
        const skip = this.shadowRoot?.getElementById('skip') as HTMLInputElement;
        if(skip.checked){
            settingsStore.set('skip_welcome', true);
        }
        location.href = '?projects';
    }

    firstUpdated() {

    }
}

window.customElements.define('ai-welcome', AiWelcome);
