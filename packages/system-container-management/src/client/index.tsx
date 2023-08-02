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

		socket.on('login', (success: boolean) => {
			console.log('Login', success);
		});

		socket.connect();
	}, []);

	return (
		<div className='min-h-screen bg-zinc-800 text-zinc-100'>
			<div className='h-screen grid place-items-center'>
				<div className='p-4 border border-white border-opacity-10 rounded-lg'>
					<h1 className='text-4xl font-bold text-center'>
						RedDeploy System Container Management
					</h1>
					<h3 className='text-xl'>Please log in</h3>
					<form
						className='flex flex-col gap-2 mt-4'
						onSubmit={(e) => {
							e.preventDefault();

							const data = new FormData(e.target as HTMLFormElement);

							const username = data.get('username') as string;
							const password = data.get('password') as string;

							if (username.length <= 0 || password.length <= 0) return;

							socket.emit('login', { username, password });
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
						<button className='p-2 bg-zinc-700 rounded-lg w-full'>
							Log in
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
