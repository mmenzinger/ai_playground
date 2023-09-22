import { useState, useEffect, useRef } from 'react';
import { Console as ConsoleFeed, Decode } from 'console-feed';

import store from '@store';

// https://github.com/samdenty/console-feed/blob/master/src/definitions/Styles.d.ts
const theme = {
    LOG_COLOR: 'black',
};

export function Console() {
    const [logs, setLogs] = useState<any>([]);
    const logEnd = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const id = store.project.subscribeToLogs((logStrings) => {
            const logs = logStrings.map((json: string) =>
                Decode(JSON.parse(json))
            );
            if (logs.length) {
                setLogs((currLogs: any[]) => [...currLogs, ...logs]);
            } else {
                setLogs([]);
            }
        });
        return () => {
            store.project.unsubscribeFromLogs(id);
        };
    }, []);

    useEffect(() => {
        logEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="h-full">
            <ConsoleFeed logs={logs} styles={theme} />
            <div ref={logEnd} />
        </div>
    );
}

export default Console;
