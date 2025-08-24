import { useState, useEffect, useRef } from 'react';
import { Console as ConsoleFeed, Decode } from 'console-feed';

import store from '@store';

// https://github.com/samdenty/console-feed/blob/master/src/definitions/Styles.d.ts
const theme = {
    // Log icons
    // LOG_ICON_WIDTH?: string | number
    // LOG_ICON_HEIGHT?: string | number

    // Log colors
    // LOG_ICON => CSS background-image property
    LOG_COLOR: 'var(--color-base-content)',
    // LOG_ICON?: string
    LOG_BACKGROUND: 'var(--color-base-100)',
    // LOG_ICON_BACKGROUND_SIZE?: string
    LOG_BORDER: 'var(--color-base-200)',

    LOG_INFO_COLOR: 'var(--color-info-content)',
    // LOG_INFO_ICON?: string
    LOG_INFO_BACKGROUND: 'var(--color-info)',
    LOG_INFO_BORDER: 'var(--color-info-content)',

    LOG_COMMAND_COLOR: 'var(--color-primary-content)',
    // LOG_COMMAND_ICON?: string
    LOG_COMMAND_BACKGROUND: 'var(--color-primary)',
    LOG_COMMAND_BORDER: 'var(--color-primary-content)',

    LOG_RESULT_COLOR: 'var(--color-success-content)',
    // LOG_RESULT_ICON?: string
    LOG_RESULT_BACKGROUND: 'var(--color-success)',
    LOG_RESULT_BORDER: 'var(--color-success-content)',

    LOG_WARN_COLOR: 'var(--color-warning-content)',
    // LOG_WARN_ICON?: string
    LOG_WARN_BACKGROUND: 'var(--color-warning)',
    LOG_WARN_BORDER: 'var(--color-warning-content)',

    LOG_ERROR_COLOR: 'var(--color-error-content)',
    // LOG_ERROR_ICON?: string
    LOG_ERROR_BACKGROUND: 'var(--color-error)',
    LOG_ERROR_BORDER: 'var(--color-error-content)',

    // Fonts
    BASE_FONT_FAMILY: 'var(--font-console)',
    BASE_FONT_SIZE: 'var(--font-size-console)',
    BASE_LINE_HEIGHT: 1.2,

    // Spacing
    PADDING: "0",

    // react-inspector
    BASE_BACKGROUND_COLOR: 'var(--color-base-100)',
    BASE_COLOR: 'var(--color-base-content)',

    OBJECT_NAME_COLOR: 'var(--color-primary)',
    OBJECT_VALUE_NULL_COLOR: 'var(--color-base-content)',
    OBJECT_VALUE_UNDEFINED_COLOR: 'var(--color-base-content)',
    OBJECT_VALUE_REGEXP_COLOR: 'var(--color-base-content)',
    OBJECT_VALUE_STRING_COLOR: 'var(--color-base-content)',
    OBJECT_VALUE_SYMBOL_COLOR: 'var(--color-base-content)',
    OBJECT_VALUE_NUMBER_COLOR: 'var(--color-base-content)',
    OBJECT_VALUE_BOOLEAN_COLOR: 'var(--color-base-content)',
    OBJECT_VALUE_FUNCTION_KEYWORD_COLOR: 'var(--color-base-content)',

    // HTML_TAG_COLOR?: any
    // HTML_TAGNAME_COLOR?: any
    // HTML_TAGNAME_TEXT_TRANSFORM?: any
    // HTML_ATTRIBUTE_NAME_COLOR?: any
    // HTML_ATTRIBUTE_VALUE_COLOR?: any
    // HTML_COMMENT_COLOR?: any
    // HTML_DOCTYPE_COLOR?: any

    // ARROW_COLOR?: any
    // ARROW_MARGIN_RIGHT?: any
    // ARROW_FONT_SIZE?: any

    // TREENODE_FONT_FAMILY?: any
    // TREENODE_FONT_SIZE?: any
    // TREENODE_LINE_HEIGHT?: any
    // TREENODE_PADDING_LEFT?: any

    // TABLE_BORDER_COLOR?: any
    // TABLE_TH_BACKGROUND_COLOR?: any
    // TABLE_TH_HOVER_COLOR?: any
    // TABLE_SORT_ICON_COLOR?: any
    // TABLE_DATA_BACKGROUND_IMAGE?: any
    // TABLE_DATA_BACKGROUND_SIZE?: any

    // [style: string]: any
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
        <div className="h-full overflow-auto">
            <ConsoleFeed logs={logs} styles={theme} />
            <div ref={logEnd} />
        </div>
    );
}

export default Console;
