import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './components/app';

// TODO: remove, just for debugging
// const worker = new Worker(`/scenario-worker.js`, { type: 'module' });
// worker.onmessage = (m: MessageEvent) => {
//     postMessage(m.data);
// };

ReactDOM.render(<App />, document.getElementById('output'));
