import { createRoot } from 'react-dom/client';
import useSocket from './util/useSocket';

createRoot(document.getElementById('root')!).render(<App />);

function App() {
	const socket = useSocket();

	return <>Hello</>;
}
