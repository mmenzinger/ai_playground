import { createRoot } from 'react-dom/client';
import App from './components/app';

const container = document.getElementById('output');
const root = createRoot(container!);
root.render(<App />);
