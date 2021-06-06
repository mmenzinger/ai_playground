import React, { useState, useEffect, useRef } from 'react';
import { Console as ConsoleFeed, Decode } from 'console-feed';
import { MessageType } from '@worker/worker-utils';

import css from './console.module.css';

// https://github.com/samdenty/console-feed/blob/master/src/definitions/Styles.d.ts
const theme = {
    LOG_COLOR: 'black',
};

export function Console() {
    const [logs, setLogs] = useState<any>([]);
    const logEnd = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.onmessage = (m: MessageEvent) => {
            if (m.data.type === MessageType.LOG) {
                const logs = m.data.logs.map((json: string) =>
                    Decode(JSON.parse(json))
                );
                setLogs((currLogs: any[]) => [...currLogs, ...logs]);
            }
        };
    }, []);

    useEffect(() => {
        logEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className={css.root}>
            <ConsoleFeed logs={logs} styles={theme} />
            <div ref={logEnd} />
        </div>
    );
}

export default Console;
