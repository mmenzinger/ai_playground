import { html, unsafeCSS } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from 'src/store.js';
import { LazyElement } from 'components/elements/lazy-element.js';

import 'components/elements/ai-header.js';
import 'components/elements/golden-layout.js';
import 'components/elements/file-tree.js';
import 'components/elements/c4f-editor.js';
import 'components/elements/ai-simulator.js';
import 'components/elements/c4f-console.js';

class AiProject extends connect(store)(LazyElement) {
    render() {
        const settings = JSON.stringify({
            showPopoutIcon: false,
            showMaximiseIcon: true,
            reorderEnabled: false,
            showCloseIcon: false,
        });

        const content = JSON.stringify([{
            type: 'row',
            content: [{
                type: 'column',
                content: [{
                    type: 'row',
                    content: [
                        {
                            type: 'component',
                            componentName: 'Files',
                            isClosable: false,
                            width: 30,
                        },
                        {
                            type: 'component',
                            componentName: 'Editor',
                            isClosable: false,
                        }
                    ]
                }, {
                    type: 'component',
                    componentName: 'Console',
                    isClosable: false,
                    height: 10,
                }]
            }, {
                type: 'component',
                componentName: 'Simulation',
                isClosable: false,
                width: 10,
            }]
        }]);

        const components = JSON.stringify([
            {
                name: 'Simulation',
                content: '<ai-simulator></ai-simulator>'
            },
            {
                name: 'Files',
                content: '<file-tree></file-tree>'
            },
            {
                name: 'Editor',
                content: '<c4f-editor></c4f-editor>'
            },
            {
                name: 'Console',
                content: '<c4f-console></c4f-console>'
            },
        ]);

        return html`
            <golden-layout content=${content} components=${components} settings=${settings} save="true"></golden-layout>
        `;
    }

    firstUpdated() {
    }

    stateChanged(state) {
    }
}

window.customElements.define('ai-project', AiProject);
