import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/figtree';
import '@fontsource/figtree/700.css';
import '@fontsource/figtree/900.css';
import './index.css';
import useSocket from './util/useSocket';
import Spinner from './components/Spinner';

function App() {
	const socket = useSocket();

	useEffect(() => {
		socket.on('connect', () => {
			console.log('[SOCKET]: Connected!');
		});

		socket.connect();
	}, []);

	return (
		<div className='bg-zinc-800 text-zinc-100 min-h-screen'>
			<div className='grid place-items-center text-center'>
				<div>
					<h1>Installing...</h1>
					<div className='w-64'>
						<Spinner />
					</div>
				</div>
			</div>
		</div>
	);
}

ReactDOM.createRoot(document.querySelector('#root')!).render(<App />);
