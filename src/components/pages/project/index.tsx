import React, { useEffect, useState } from 'react';
import { Spinner, Tabs, Tab } from 'react-bootstrap';
// @ts-ignore missing type definitions...
import Split from 'react-split';

// import { Link } from 'react-router-dom';
// import { autorun } from 'mobx';

import store, { Project as tProject } from '@store';

import Console from '@elements/console';
import FileTree from '@elements/file-tree/index';

import { useParams } from 'react-router';
import css from './project.module.css';
import './tabs.css';

export function Project() {
    const { id } = useParams<{ id: string }>();

    const splits = store.settings.getLocal('splits', {
        split1: [60, 40],
        split2: [80, 20],
        split3: [30, 70],
    });
    const [split1, setSplit1] = useState(splits.split1);
    const [split2, setSplit2] = useState(splits.split2);
    const [split3, setSplit3] = useState(splits.split3);

    const [project, setProject] = useState<tProject | null>(null);

    const [middleTab, setMiddleTab] = useState('editor');

    useEffect(() => {
        store.project.openProject(Number(id)).then((p) => setProject(p));
        return () => {
            setProject(null);
            store.project.closeProject();
        };
    }, []);

    useEffect(() => {
        store.settings.setLocal('splits', { split1, split2, split3 });
    }, [split1, split2, split3]);

    if (!project) {
        return (
            <div className={css.loading}>
                <Spinner animation="border" />
                <span>Loading</span>
            </div>
        );
    }

    return (
        <Split
            className={`${css.root} ${css.horizontal}`}
            sizes={split1}
            minSize={200}
            expandToMin={true}
            gutterSize={6}
            onDragEnd={(e: number[]) => setSplit1(e)}
        >
            <Split
                className={css.vertical}
                direction="vertical"
                sizes={split2}
                minSize={50}
                expandToMin={true}
                gutterSize={6}
                onDragEnd={(e: number[]) => setSplit2(e)}
            >
                <Split
                    className={css.horizontal}
                    sizes={split3}
                    minSize={100}
                    gutterSize={6}
                    // expandToMin={true} // somehow this one is buggy... (always jumps to min after reload)
                    onDragEnd={(e: number[]) => setSplit3(e)}
                >
                    <div className={css.pane}>
                        <FileTree project={project} />
                    </div>
                    <div className={css.pane}>
                        <div>
                            <Tabs
                                className={css.tabs}
                                activeKey={middleTab}
                                onSelect={(tab) =>
                                    setMiddleTab(tab || 'editor')
                                }
                            >
                                <Tab eventKey="editor" title="Editor">
                                    Editor
                                </Tab>
                                <Tab eventKey="markdown" title="Markdown">
                                    Markdown
                                </Tab>
                                <Tab eventKey="settings" title="Settings">
                                    Settings
                                </Tab>
                            </Tabs>
                        </div>
                    </div>
                </Split>
                <div className={css.pane}>
                    <Console />
                </div>
            </Split>
            <div className={css.pane}>Simulator</div>
        </Split>
    );
}

export default Project;
