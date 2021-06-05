import React, { useState, useEffect } from 'react';
import store, { File, Project } from '@store';
import { autorun } from 'mobx';

import Tree from 'rc-tree';
import { DataNode } from 'rc-tree/lib/interface';

import 'rc-tree/assets/index.css';
import './animation.css';
import './contextmenu.css';
import { ListGroup, Popover } from 'react-bootstrap';

const motion = {
    motionName: 'node-motion',
    motionAppear: false,
    onAppearStart: () => ({ height: 0 }),
    onAppearActive: (node: any) => ({ height: node.scrollHeight }),
    onLeaveStart: (node: any) => ({ height: node.offsetHeight }),
    onLeaveActive: () => ({ height: 0 }),
};

type Menu = {
    filename: React.ReactNode;
    id: number;
    x: number;
    y: number;
};

export function FileTree(props: { project: Project }) {
    const [files, setFiles] = useState<DataNode[]>([]);
    const [selected, setSelected] = useState<string | number>();
    const [menu, setMenu] = useState<Menu | null>(null);

    let closed = false;
    useEffect(() => {
        autorun(async () => {
            store.project.lastFileTreeChange;

            const [projectFiles, globalFiles] = await Promise.all([
                store.project.getProjectFiles(props.project.id),
                store.project.getProjectFiles(0),
            ]);

            !closed && setFiles(getTreeData(projectFiles, globalFiles));
        });
        return () => {
            closed = true;
        };
    }, []);

    function onRightClick(info: {
        event: React.MouseEvent<Element, MouseEvent>;
        node: DataNode;
    }) {
        setMenu({
            filename: info.node.title,
            id: Number(info.node.key) || 0,
            x: info.event.pageX + 10,
            y: info.event.pageY - 45,
        });
        document.addEventListener('click', () => setMenu(null), { once: true });
    }

    return (
        <div>
            {menu ? (
                <Popover id="contextMenu" style={{ top: menu.y, left: menu.x }}>
                    <Popover.Title as="h3">{menu.filename}</Popover.Title>
                    <Popover.Content>
                        <ListGroup>
                            <ListGroup.Item
                                action
                                onClick={() => {
                                    createFile(props.project.id, menu.id);
                                }}
                            >
                                Create File
                            </ListGroup.Item>
                            <ListGroup.Item action>Upload File</ListGroup.Item>
                            <ListGroup.Item action>
                                Download File
                            </ListGroup.Item>
                        </ListGroup>
                    </Popover.Content>
                </Popover>
            ) : null}
            <Tree
                onRightClick={onRightClick}
                treeData={files}
                motion={motion}
            />
        </div>
    );
}

function createFile(projectId: number, parentId: number) {
    console.log('create file', projectId, parentId);
}

function fileToDataNode(file: File): DataNode {
    return {
        key: file.id,
        title: file.name,
    };
}

function getTreeData(projectFiles: File[], globalFiles: File[]): DataNode[] {
    // const errors = store.project.activeProject?.errors || {};
    // if (!store.project.activeFile) {
    //     throw Error('thisShouldNotHappen');
    // } else {
    //     //await fileTree.updateFiles(globalFiles, projectFiles, projectStore.activeFile, errors);
    // }
    // console.log(projectFiles, globalFiles);
    return [
        {
            key: 'global',
            title: 'global',
            children: globalFiles.map(fileToDataNode),
        },
        {
            key: 'project',
            title: 'project',
            children: projectFiles.map(fileToDataNode),
        },
    ];
}

export default FileTree;
