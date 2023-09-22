import { useState, useEffect } from 'react';
import { autorun } from 'mobx';
import store, { File } from '@store';

import Editor from './editor';
import Markdown from './markdown';

export function FileViewer() {
    const [tab, setTab] = useState<string>();
    const [editorEnabled, setEditorEnabled] = useState<boolean>(true);
    const [markdownEnabled, setMarkdownEnabled] = useState<boolean>(true);
    const [imageEnabled, setImageEnabled] = useState<boolean>(true);
    const [file, setFile] = useState<File>();

    let closed = false;
    useEffect(() => {
        autorun(() => {
            if (!closed) {
                const _file = store.project.activeFile;
                const _type = _file?.name.split('.').pop();
                setFile(_file || undefined);
                if (_type === 'md') {
                    setTab('markdown');
                    setMarkdownEnabled(true);
                    setEditorEnabled(true);
                    setImageEnabled(false);
                } else if (_type?.match(/(png|jpe?g)/)) {
                    setTab('image');
                    setMarkdownEnabled(false);
                    setEditorEnabled(false);
                    setImageEnabled(true);
                } else {
                    setTab('editor');
                    setMarkdownEnabled(false);
                    setEditorEnabled(true);
                    setImageEnabled(false);
                }
            }
        });
        return () => {
            closed = true;
        };
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="tabs">
                <div className={"tab tab-bordered" + (tab === 'editor' ? ' tab-active' : '') + (!editorEnabled ? ' tab-disabled' : '')} onClick={editorEnabled ? ()=>setTab('editor') : undefined}>Editor</div>
                <div className={"tab tab-bordered" + (tab === 'markdown' ? ' tab-active' : '') + (!markdownEnabled ? ' tab-disabled' : '')} onClick={markdownEnabled ? ()=>setTab('markdown') : undefined}>Markdown</div>
                <div className={"tab tab-bordered" + (tab === 'image' ? ' tab-active' : '') + (!imageEnabled ? ' tab-disabled' : '')} onClick={imageEnabled ? ()=>setTab('image') : undefined}>Image</div>
            </div>
            {tab === 'editor' ? <div className="flex-grow overflow-hidden">
                <Editor />
            </div> : null}
            {tab === 'markdown' ? <div className="">
                <Markdown />
            </div> : null}
            {tab === 'image' ? <div className="">
                <img
                    className=""
                    src={`/${store.project.activeProject?.id || 'assets'}/${
                        file?.id ? `file/${file.id}` : 'logo.png'
                    }`}
                />
            </div> : null}
        </div>
    );
}
export default FileViewer;
