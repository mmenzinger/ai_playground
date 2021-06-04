import React, { useState, useEffect, useRef } from 'react';
import Tree from 'rc-tree';

import 'rc-tree/assets/index.css';
import './animation.css';

const testData = [
    {
        key: '0',
        title: 'node 0',
        children: [
            { key: '0-0', title: 'node 0-0' },
            { key: '0-1', title: 'node 0-1' },
            {
                key: '0-2',
                title: 'node 0-2',
                children: [
                    { key: '0-2-0', title: 'node 0-2-0' },
                    { key: '0-2-1', title: 'node 0-2-1' },
                    { key: '0-2-2', title: 'node 0-2-2' },
                ],
            },
            { key: '0-3', title: 'node 0-3' },
            { key: '0-4', title: 'node 0-4' },
            { key: '0-5', title: 'node 0-5' },
            { key: '0-6', title: 'node 0-6' },
            { key: '0-7', title: 'node 0-7' },
            { key: '0-8', title: 'node 0-8' },
            {
                key: '0-9',
                title: 'node 0-9',
                children: [
                    { key: '0-9-0', title: 'node 0-9-0' },
                    {
                        key: '0-9-1',
                        title: 'node 0-9-1',
                        children: [
                            { key: '0-9-1-0', title: 'node 0-9-1-0' },
                            { key: '0-9-1-1', title: 'node 0-9-1-1' },
                            { key: '0-9-1-2', title: 'node 0-9-1-2' },
                            { key: '0-9-1-3', title: 'node 0-9-1-3' },
                            { key: '0-9-1-4', title: 'node 0-9-1-4' },
                        ],
                    },
                    {
                        key: '0-9-2',
                        title: 'node 0-9-2',
                        children: [
                            { key: '0-9-2-0', title: 'node 0-9-2-0' },
                            { key: '0-9-2-1', title: 'node 0-9-2-1' },
                        ],
                    },
                ],
            },
        ],
    },
];

const motion = {
    motionName: 'node-motion',
    motionAppear: false,
    onAppearStart: () => ({ height: 0 }),
    onAppearActive: (node: any) => ({ height: node.scrollHeight }),
    onLeaveStart: (node: any) => ({ height: node.offsetHeight }),
    onLeaveActive: () => ({ height: 0 }),
};

export function FileTree() {
    return <Tree treeData={testData} motion={motion} />;
}

export default FileTree;
