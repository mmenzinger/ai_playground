import React from 'react';

import css from './impressum.module.css';

export function Impressum() {
    return (
        <div className={css.root}>
            <h1>Impressum</h1>

            <h2>Media Owner</h2>
            <p>
                Manuel Menzinger, Laßnitzhöhe, Austria
                <br />
                <a href="mailto:admin@c4f.wtf">admin@c4f.wtf</a>
            </p>

            <h2>Basic Line</h2>
            <p>Open educational resource, AI programming playground</p>

            <h2>Privacy Policy</h2>
            <p>
                This website does store all its user-data locally inside the
                browser. No data is transmitted to any server at any time!
            </p>

            <h2>Source Code</h2>
            <p>
                The source code can be found on{' '}
                <a href="https://github.com/c4f-wtf/ai">GitHub</a>.
            </p>
        </div>
    );
}
export default Impressum;
