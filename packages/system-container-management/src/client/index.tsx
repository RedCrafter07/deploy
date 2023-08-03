import { createRoot } from 'react-dom/client';
import useSocket from './util/useSocket';
import '@fontsource/figtree';
import './index.css';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { AnimatePresence, motion } from 'framer-motion';

createRoot(document.getElementById('root')!).render(<App />);

function App() {
	const socket = useSocket();

	const [view, setView] = useState<'login' | 'home'>('login');

	useEffect(() => {
		socket.on('connect', () => {
			console.log('Connected to server');
		});

		socket.on('login', (success: boolean) => {
			if (success) setView('home');
		});

		socket.connect();
	}, []);

	return (
		<AnimatePresence initial={false} mode='wait'>
			<motion.div
				key={view}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.3 }}
			>
				{view == 'home' ? <Home socket={socket} /> : <Login socket={socket} />}
			</motion.div>
		</AnimatePresence>
	);
}

function Home(props: { socket: Socket }) {
	const { socket } = props;

	useEffect(() => {
		socket.on('getContainers', (d) => {
			console.log(d);
		});
		socket.emit('getContainers');
	}, []);

	return (
		<div className='min-h-screen bg-zinc-800 text-zinc-100'>
			<h1 className='text-3xl'>Welcome to the RedDeploy Admin Panel</h1>
		</div>
	);
}

function Login(props: { socket: Socket }) {
	const { socket } = props;
	return (
		<div className='min-h-screen bg-zinc-800 text-zinc-100'>
			<div className='h-screen grid place-items-center'>
				<div className='p-4 border border-white border-opacity-10 rounded-lg'>
					<h1 className='text-3xl font-bold text-center'>
						RedDeploy System Container Management
					</h1>
					<h3 className='text-xl'>Please log in</h3>
					<form
						className='flex flex-col gap-4 mt-4'
						onSubmit={(e) => {
							e.preventDefault();

							const data = new FormData(e.target as HTMLFormElement);

							const username = data.get('username') as string;
							const password = data.get('password') as string;

							if (username.length <= 0 || password.length <= 0) return;

							socket.emit('login', username, password);
						}}
					>
						<label className='flex flex-col gap-1'>
							<span>Username</span>
							<input name='username' type='text' className='input' required />
						</label>
						<label className='flex flex-col gap-1'>
							<span>Password</span>
							<input
								type='password'
								name='password'
								className='input'
								required
							/>
						</label>
						<button className='p-2 bg-zinc-700 rounded-lg w-full hover:bg-green-600 active:scale-95 transition-all duration-100'>
							Log in
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
