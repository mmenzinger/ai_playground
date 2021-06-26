import React, { useState, useEffect, useRef } from 'react';
import store from '@src/store';
import { autorun } from 'mobx';

import showdown from 'showdown';

import Prism from 'prismjs';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/components/prism-prolog';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';

import css from './markdown.module.css';
import 'prismjs/themes/prism.css';

function updateHyperlinks(element: HTMLElement) {
    const anchors = element.querySelectorAll('a');
    anchors.forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (href && href[0] === '#') {
            anchor.onclick = (event) => {
                event.preventDefault();
                const target = element.querySelector(href);
                if (target) target.scrollIntoView();
            };
        }
    });
}

function updateCodeHighlight(element: HTMLElement) {
    for (const pre of element.querySelectorAll('pre')) {
        pre.classList.add('line-numbers');
    }
    Prism.highlightAllUnder(element);
}

const converter = new showdown.Converter({
    ghCompatibleHeaderId: true,
    parseImgDimensions: true,
    strikethrough: true,
    tables: true,
    takslists: true,
    smoothLivePreview: true,
});

export function Markdown() {
    const [text, setText] = useState('');
    const container = useRef<HTMLDivElement>(null);

    let closed = false;
    useEffect(() => {
        autorun(() => {
            const file = store.project.activeFile;
            if (
                file?.name.endsWith('.md') &&
                file?.content &&
                !(file.content instanceof Blob)
            ) {
                !closed && setText(converter.makeHtml(file.content));
            }
        });
        return () => {
            closed = true;
        };
    }, []);

    useEffect(() => {
        let element = container.current as HTMLElement;
        if (element) {
            updateHyperlinks(element);
            updateCodeHighlight(element);
        }
    });

    return (
        <div
            ref={container}
            className={css.root}
            dangerouslySetInnerHTML={{ __html: text }}
        ></div>
    );
}
export default Markdown;
