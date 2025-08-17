import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import Splitter, { SplitDirection } from '@devbookhq/splitter';

// import { Link } from 'react-router-dom';
// import { autorun } from 'mobx';

import store, { Project as tProject } from '@store';

import Console from '@elements/console';
import FileTree from '@elements/file-tree/index';
import FileViewer from '@elements/file-viewer';
import Simulator from '@elements/simulator';

import { useParams } from 'react-router-dom';
import { autorun } from 'mobx';

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

    const [enableEventCapture, setEnableEventCapture] = useState(true);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [, setCenterTab] = useState('settings');

    useEffect(() => {
        store.project.openProject(Number(id)).then((p) => setProject(p));
        return () => {
            setProject(null);
            store.project.closeProject();
        };
    }, []);

    useEffect(() => {
        autorun(() => {
            if (store.project.activeFile) {
                setCenterTab('file');
            }
        });
    }, []);

    useEffect(() => {
        store.settings.setLocal('splits', { split1, split2, split3 });
    }, [split1, split2, split3]);

    if (!project) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner animation="border" />
                <span>Loading</span>
            </div>
        );
    }

    return (
        <Splitter
            initialSizes={split1}
            direction={SplitDirection.Horizontal}
            onResizeFinished={(_:number, e: number[]) => {
                setSplit1(e);
                setEnableEventCapture(true);
            }}
            onResizeStarted={(_:number) => {
                setEnableEventCapture(false);
            }}
            gutterClassName="bg-base-300"
        >
            <Splitter
                direction={SplitDirection.Vertical}
                initialSizes={split2}
                onResizeFinished={(_:number, e: number[]) => setSplit2(e)}
                gutterClassName="bg-base-300"
            >
                <Splitter
                    direction={SplitDirection.Horizontal}
                    initialSizes={split3}
                    onResizeFinished={(_:number, e: number[]) => setSplit3(e)}
                    gutterClassName="bg-base-300"
                >
                    <div className="h-full">
                        <FileTree project={project} />
                    </div>
                    <div className="h-full">
                        <FileViewer />
                    </div>
                </Splitter>
                <div className="h-full">
                    <Console />
                </div>
            </Splitter>
            <div className="h-full relative">
                <Simulator enableEventCapture={enableEventCapture} />
            </div>
        </Splitter>
    );
}

export default Project;
