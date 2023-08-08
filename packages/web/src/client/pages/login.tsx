import axios from 'axios';
import { io } from 'socket.io-client';

export default function Login() {
	return (
		<div className='min-h-screen bg-zinc-900 text-zinc-50'>
			<div className='container mx-auto p-2'>
				<h1 className='text-3xl'>Login</h1>
				<h3 className='text-xl'>Please log in to RedDeploy.</h3>

				<div className='grid place-items-center'>
					<div className='p-8 rounded-lg bg-zinc-700 border-2 border-zinc-800'>
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
						>
							<label htmlFor='username'>Username</label>
							<input
								className='input'
								type='text'
								name='username'
								id='username'
							/>

							<label htmlFor='password'>Password</label>
							<input
								className='input'
								type='password'
								name='password'
								id='password'
							/>

							<button
								className='w-full bg-zinc-800 rounded-lg text-center p-2 hover:bg-green-600 active:scale-95'
								type='submit'
							>
								Login
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
