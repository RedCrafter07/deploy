import { useEffect, useState } from 'react';
import useSocket from '../util/useSocket';
import { AnimatePresence, motion } from 'framer-motion';
import { Login } from './home';
import { Socket } from 'socket.io-client';

export default function SetupProxy() {
	const socket = useSocket();
	const [view, setView] = useState<'login' | 'home'>('login');

	useEffect(() => {
		socket.on('connect', () => {
			console.log('Connected to server');
		});

		socket.on('login', (success: boolean) => {
			if (success) setView('home');
		});

		socket.on('reload', () => {
			window.location.reload();
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
				{view == 'home' ? (
					<LoggedIn socket={socket} />
				) : (
					<Login socket={socket} />
				)}
			</motion.div>
		</AnimatePresence>
	);
}

function LoggedIn(props: { socket: Socket }) {
	const { socket } = props;

	return (
		<div className='bg-zinc-800 min-h-screen'>
			<div className='container mx-auto p-2'>
				<h1 className='text-3xl'>Proxy Setup</h1>
				<h3 className='text-xl'>
					Before accessing RedDeploy, we need to setup the proxy first.
				</h3>

				<div className='my-4' />

				<h2 className='text-2xl'>1. Configure an API User</h2>
				<p>
					First, we need to configure an API User in the NGINX Proxy Manager.
					This will be an additional account, which will be used to access the
					NPM Api.
				</p>

				<div className='my-4' />

				<p>Navigate to your NPM Instance and go to the "Users" tab</p>
				<p>
					Create a new user and save its credentials. A strong password is
					recommended.
				</p>
				<p>
					Only needed "manage permissions" for "Proxy Hosts" and "SSL
					Certificates", no Admin Privileges needed!
				</p>
				<p>
					Now, enter the Nginx Proxy Manager Access URL and the user
					credentials:
				</p>

				<div className='my-4' />

				<form
					onSubmit={(e) => {
						e.preventDefault();

						const data = new FormData(e.target as HTMLFormElement);

						socket.emit('npm config', {
							url: data.get('url'),
							email: data.get('email'),
							password: data.get('password'),
						});
					}}
				>
					<input
						type='text'
						className='input'
						placeholder='http://127.0.0.1:81'
						name='url'
					/>

					<div className='my-2' />

					<input
						type='text'
						className='input'
						placeholder='user@example.com'
						name='email'
					/>

					<div className='my-2' />

					<input
						type='password'
						className='input'
						placeholder='SuperSecurePassword'
						name='password'
					/>

					<div className='my-4' />

					<h2 className='text-2xl'>2. Confirm the configuration</h2>
					<p>
						Now, we need to confirm the configuration. Please check if the
						credentials are correct and if the NPM Access URL is correct. The
						settings can be changed later, they are important for the first
						setup though.
					</p>

					<div className='my-4' />

					<button className='px-4 py-2 rounded-lg bg-green-600'>
						Confirm and continue
					</button>
				</form>
			</div>
		</div>
	);
}
