import React, { useState, useEffect } from 'react';
import { autorun } from 'mobx';
import store, { File } from '@store';
import { Tabs, Tab } from 'react-bootstrap';

import Editor from './editor';
import Markdown from './markdown';

import css from './file-viewer.module.css';

export function FileViewer() {
    const [tab, setTab] = useState<string>();
    const [type, setType] = useState<string>();
    const [toggle, setToggle] = useState<string>();
    const [file, setFile] = useState<File>();

    let closed = false;
    useEffect(() => {
        autorun(() => {
            if (!closed) {
                const _file = store.project.activeFile;
                const _type = _file?.name.split('.').pop();
                setType(_type);
                setFile(_file || undefined);
                if (_type === 'md') {
                    setTab('markdown');
                } else if (_type?.match(/(png|jpe?g)/)) {
                    setTab('image');
                } else {
                    setTab('editor');
                }
            }
        });
        return () => {
            closed = true;
        };
    }, []);

    useEffect(() => {
        if (tab === 'markdown') {
            setToggle('editor');
        } else if (tab === 'editor' && type === 'md') {
            setToggle('markdown');
        } else {
            setToggle(undefined);
        }
    }, [tab, type]);

    return (
        <div className={css.root}>
            <Tabs
                className={[css.tabs, toggle]}
                activeKey={tab}
                onSelect={(tab) => setTab(tab || undefined)}
                variant="pills"
            >
                <Tab eventKey="editor" title="Editor">
                    <Editor />
                </Tab>
                <Tab eventKey="markdown" title="Markdown">
                    <Markdown />
                </Tab>
                <Tab eventKey="image" title="Image">
                    <img
                        className={css.image}
                        src={`/${store.project.activeProject?.id || 'assets'}/${
                            file?.id ? `file/${file.id}` : 'logo.png'
                        }`}
                    />
                </Tab>
            </Tabs>
        </div>
    );
}
export default FileViewer;
