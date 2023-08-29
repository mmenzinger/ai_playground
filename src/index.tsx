import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/app';

// TODO: remove, just for debugging
// const worker = new Worker(`/scenario-worker.js`, { type: 'module' });
// worker.onmessage = (m: MessageEvent) => {
//     postMessage(m.data);
// };
const container = document.getElementById('output');
const root = createRoot(container!);
root.render(<App />);
