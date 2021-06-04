import projectStore from '@src/store/project-store';
import { Log, LogType } from '@src/store/types';
import { autorun } from 'mobx';
import React, { useState, useEffect, useRef } from 'react';
import { ObjectInspector, chromeLight, InspectorTheme } from 'react-inspector';
import { Hook, Unhook, Console as ConsoleFeed, Decode } from 'console-feed';

import css from './console.module.css';

// https://github.com/samdenty/console-feed/blob/master/src/definitions/Styles.d.ts
const theme = {
    LOG_COLOR: 'black',
};

export function Console() {
    const [logs, setLogs] = useState<any>([]);
    const logEnd = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const console = Hook(window.console, (log) => {
            setLogs((currLogs: any[]) => [...currLogs, Decode(log)]);
        });
        return () => {
            Unhook(console);
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
