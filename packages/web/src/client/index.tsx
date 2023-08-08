import { createRoot } from 'react-dom/client';
import Router from './core/router';
import '@fontsource-variable/figtree';
import './index.css';

createRoot(document.getElementById('root')!).render(<Router />);
