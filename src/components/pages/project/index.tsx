import React, { useEffect, useState } from 'react';
import { Card, Button, ButtonGroup, CardDeck } from 'react-bootstrap';
// @ts-ignore missing type definitions...
import Split from 'react-split';

// import { Link } from 'react-router-dom';
// import { autorun } from 'mobx';

// import appStore from '@store/app-store';
import projectStore from '@store/project-store';
import settingsStore from '@store/settings-store';

import Console from '@elements/console';
import FileTree from '@elements/file-tree/index';

import { Project as tProject } from '@store/types';

import db from '@localdb';
import { useParams } from 'react-router';
import css from './project.module.css';

export function Project() {
    const { id } = useParams<{ id: string }>();
    const splits = settingsStore.get('splits', {
        split1: [50, 50],
        split2: [50, 50],
        split3: [50, 50],
    });

    const [split1, setSplit1] = useState(splits.split1);
    const [split2, setSplit2] = useState(splits.split2);
    const [split3, setSplit3] = useState(splits.split3);

    useEffect(() => {
        settingsStore.set('splits', { split1, split2, split3 });
    }, [split1, split2, split3]);

    return (
        <Split
            className={`${css.root} ${css.horizontal}`}
            sizes={split1}
            minSize={200}
            expandToMin={true}
            onDragEnd={(e: number[]) => setSplit1(e)}
        >
            <Split
                className={css.vertical}
                direction="vertical"
                sizes={split2}
                minSize={50}
                expandToMin={true}
                onDragEnd={(e: number[]) => setSplit2(e)}
            >
                <Split
                    className={css.horizontal}
                    sizes={split3}
                    minSize={100}
                    // expandToMin={true} // somehow this one is buggy... (always jumps to min after reload)
                    onDragEnd={(e: number[]) => setSplit3(e)}
                >
                    <FileTree />
                    <div>Editor</div>
                </Split>
                <Console />
            </Split>
            <div>Simulator</div>
        </Split>
    );
}

export default Project;
