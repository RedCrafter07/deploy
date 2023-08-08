import axios from 'axios';
import { io } from 'socket.io-client';

export default function Login() {
	return (
		<div className='min-h-screen bg-zinc-950 text-zinc-50'>
			<div className='grid place-items-center w-full h-screen'>
				<div className='p-8 rounded-lg bg-zinc-900'>
					<h1 className='text-3xl'>RedDeploy Web Interface Login</h1>
					<h3 className='text-xl'>Please log in to RedDeploy.</h3>
					<form
						onSubmit={(e) => {
							console.log('submitting!');
							e.preventDefault();

							const data = new FormData(e.target as HTMLFormElement);

							axios
								.post('/auth/login', {
									username: data.get('username'),
									password: data.get('password'),
								})
								.then(() => {
									const socket = io(window.location.origin, {
										reconnection: true,
										transports: ['websocket'],
									});

									socket.on('user', (user) => {
										console.log(user);
									});

									socket.connect();
								});
						}}
						className='flex flex-col gap-4 mt-4'
					>
						<div>
							<label htmlFor='username'>Username</label>
							<input
								className='input'
								type='text'
								name='username'
								id='username'
							/>
						</div>

						<div>
							<label htmlFor='password'>Password</label>
							<input
								className='input'
								type='password'
								name='password'
								id='password'
							/>
						</div>

						<button
							className='w-full bg-zinc-800 rounded-lg text-center p-2 hover:bg-green-600 active:scale-95 transition-all duration-100'
							type='submit'
						>
							Login
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
