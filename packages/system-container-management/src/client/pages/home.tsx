import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import useSocket from '../util/useSocket';

export default function Home() {
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
				transition={{ duration: 0.2 }}
			>
				{view == 'home' ? <Panel socket={socket} /> : <Login socket={socket} />}
			</motion.div>
		</AnimatePresence>
	);
}

function Panel(props: { socket: Socket }) {
	const { socket } = props;
	const [containers, setContainers] = useState<
		{
			name: string;
			id: string;
			running: boolean;
		}[]
	>([]);

	useEffect(() => {
		socket.on('getContainers', (d) => {
			setContainers(d);
		});
		socket.emit('getContainers');
	}, []);

	return (
		<div className='min-h-screen bg-zinc-800 text-zinc-100'>
			<div className='container mx-auto p-2'>
				<h1 className='text-3xl'>Welcome to the RedDeploy SCM Panel</h1>

				<h3 className='text-xl'>Container Overview</h3>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
					{containers.map(({ id, name, running }) => {
						return (
							<div className='p-4 rounded-lg bg-zinc-700'>
								<p title={id}>{name}</p>
								<div className='flex flex-row gap-2'>
									<span
										className={`h-2 w-2 rounded-full my-auto ${
											running ? 'bg-green-600' : 'bg-red-600'
										}`}
									/>
									<span className='text-sm my-auto'>
										{running ? 'Running' : 'Stopped'}
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export function Login(props: { socket: Socket }) {
	const { socket } = props;
	return (
		<div className='min-h-screen bg-zinc-800 text-zinc-100'>
			<div className='h-screen grid place-items-center'>
				<div className='p-8 border border-white border-opacity-10 rounded-lg'>
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
