import { createRoot } from 'react-dom/client';
import useSocket from './util/useSocket';
import '@fontsource/figtree';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

function App() {
	const socket = useSocket();

	return (
		<div className='min-h-screen bg-zinc-700 text-white'>
			<div className='container mx-auto p-2'>
				<h1 className='text-3xl'>Hello</h1>
			</div>
		</div>
	);
}
