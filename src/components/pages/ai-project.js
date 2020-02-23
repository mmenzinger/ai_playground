import { html, unsafeCSS } from 'lit-element';
import { LazyElement } from 'components/elements/lazy-element.js';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from 'src/store.js';
import { defer } from 'src/util.js';

import 'components/elements/ai-header.js';
import 'components/elements/golden-layout.js';
import 'components/elements/file-tree.js';
import 'components/elements/c4f-editor.js';
import 'components/elements/ai-simulator.js';
import 'components/elements/c4f-console.js';
import 'components/elements/c4f-markdown.js';

class AiProject extends connect(store)(LazyElement) {

    constructor(){
        super();
        this._goldenLayout = defer();
        this._currentFile = { id: 0 };
    }

    render() {
        const settings = JSON.stringify({
            showPopoutIcon: false,
            showMaximiseIcon: false,
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
                            type: 'stack',
                            content: [
                                {
                                    type: 'component',
                                    componentName: 'Editor',
                                    isClosable: false,
                                },
                                {
                                    type: 'component',
                                    componentName: 'Markdown',
                                    isClosable: false,
                                },
                            ]
                        },
                    ]
                }, {
                    type: 'component',
                    componentName: 'Console',
                    isClosable: false,
                    height: 10,
                }]
            }, {
                type: 'stack',
                content: [
                    {
                        type: 'component',
                        componentName: 'Simulation',
                        isClosable: false,
                        width: 10,
                    }, {
                        type: 'component',
                        componentName: 'Markdown',
                        isClosable: false,
                    },
                ]
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
                name: 'Markdown',
                content: '<c4f-markdown></c4f-markdown>'
            },
            {
                name: 'Console',
                content: '<c4f-console></c4f-console>'
            },
        ]);

        return html`
            <golden-layout id="gl" content=${content} components=${components} settings=${settings} save="true"></golden-layout>
        `;
    }

    firstUpdated() {
        const gl = this.shadowRoot.getElementById('gl');
        this._goldenLayout.resolve(gl);
    }

    async stateChanged(state) {
        if(state.files.currentFile !== undefined && state.files.currentFile.id !== this._currentFile.id)
        {
            this._currentFile = state.files.currentFile;
            const gl = await this._goldenLayout;
            const layout = await gl.getLayout();
            const active = this._currentFile.name.endsWith('.md') ? 1 : 0;
            const stack = layout.root.contentItems[0].contentItems[0].contentItems[0].contentItems[1];
            const item = stack.contentItems[active];
            stack.setActiveContentItem(item);
        }
    }
}

window.customElements.define('ai-project', AiProject);
