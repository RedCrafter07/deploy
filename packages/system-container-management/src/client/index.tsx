import { createRoot } from 'react-dom/client';
import useSocket from './util/useSocket';
import '@fontsource/figtree';
import './index.css';
import { useEffect } from 'react';

createRoot(document.getElementById('root')!).render(<App />);

function App() {
	const socket = useSocket();

	useEffect(() => {
		socket.on('connect', () => {
			console.log('Connected to server');
		});

		socket.connect();
	}, []);

	return (
		<div className='min-h-screen bg-zinc-800 text-zinc-100'>
			<div className='container mx-auto p-2'>
				<h1 className='text-3xl'>Hello</h1>
			</div>
		</div>
	);
}
