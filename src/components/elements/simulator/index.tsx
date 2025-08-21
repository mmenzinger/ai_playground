import { useState, useEffect, useRef } from 'react';
import store from '@src/store';
import { StoreMessage } from './worker-utils';
import db from '@src/localdb';
import { autorun } from 'mobx';

export function Simulator(props: { enableEventCapture: boolean }) {
    const iframe = useRef<HTMLIFrameElement>(null);
    const [src, setSrc] = useState<string | undefined>(undefined);

    const iframeHandler: any = {
        log: (m: MessageEvent) => store.project.publishLogs(m.data.logs),
        store: (m: MessageEvent) => storeFile(m),
    };

    useEffect(() => {
        const channel = new MessageChannel();
        const interval = setInterval(() => {
            const contentWindow = iframe.current?.contentWindow;
            if (contentWindow) {
                // set message port on iframe
                (contentWindow as any).__port = channel.port2;

                channel.port1.onmessage = (m) => {
                    const type = m.data.type as string;
                    if (iframeHandler[type]) {
                        iframeHandler[type](m);
                    }
                };

                clearInterval(interval);
            }
        }, 100);

        const disposer = autorun(async () => {
            let url = '/simulator/default.html';
            if (store.project.activeProject) {
                const id = store.project.activeProject.id;
                try{
                    await db.loadFirstFileByName(id, 'index.html');
                    url = '/project/index.html';
                }
                catch(e){
                    // no file found, keep default
                }
                url += `?pid=${store.project.activeProject.id}`;
            }
            setSrc(url);
        });

        return () => {
            clearInterval(interval);
            channel.port1.close();
            disposer();
        };
    }, []);

    return (
        <iframe
            className={`w-full h-full absolute top-0 left-0 bottom-0 right-0 ${props.enableEventCapture ? '' : '-z-10'}`}
            ref={iframe}
            src={src}
            // sandbox="allow-scripts allow-same-origin"
        />
    );
}

async function storeFile(m: MessageEvent) {
    const data: StoreMessage = m.data;
    let projectId = data.projectId || store.project.activeProject?.id;

    if (projectId) {
        try {
            const file = await db.loadFileByPath(projectId, data.fileName);
            await store.project.saveFileContent(file.id, data.data);
        } catch (_) {
            await store.project.createFile(data.fileName, projectId, data.data);
        }
        m.ports[0].postMessage(true);
    } else {
        throw Error('no active project');
    }
}

export default Simulator;