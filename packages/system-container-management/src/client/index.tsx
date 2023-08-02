import { createRoot } from 'react-dom/client';
import useSocket from './util/useSocket';
import '@fontsource/figtree';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

function App() {
	const socket = useSocket();

	return <>Hello</>;
}
