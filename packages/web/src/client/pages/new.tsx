import { useEffect, useState } from 'react';
import useSocket from '../util/useSocket';
import Switch from '../components/Switch';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function New() {
	const socket = useSocket();
	const navigate = useNavigate();

	const [withProxy, setWithProxy] = useState(false);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		socket.on('connect', () => {
			setConnected(true);
		});
		socket.connect();
	}, []);

	useEffect(() => {
		console.log(withProxy);
	}, [withProxy]);

	return (
		<div className='min-h-screen bg-zinc-900 text-zinc-50'>
			<div
				className={`absolute top-0 left-0 w-full h-screen backdrop-blur-sm ${
					!connected
						? 'opacity-100 pointer-events-auto'
						: 'opacity-0 pointer-events-none'
				} z-[42]`}
			>
				<div className='bg-black opacity-25' />
				<div className='grid place-items-center'>
					<h1 className='text-3xl'>Connecting to socket...</h1>
				</div>
			</div>
			<div className='container mx-auto p-2'>
				<h1 className='text-3xl'>Create a new project</h1>

				<form
					onSubmit={(e) => {
						e.preventDefault();

						const formData = new FormData(e.target as HTMLFormElement);

						const data = {
							name: formData.get('name'),
							repo: formData.get('repo'),
							branch: formData.get('branch'),
							username: formData.get('username'),
							token: formData.get('token'),
							withProxy,
							port: formData.get('port'),
							domain: formData.get('domain'),
						};

						socket.emit('createProject', data);

						navigate('/');
					}}
				>
					<div className='flex flex-col gap-2'>
						<label htmlFor='name'>Project name</label>
						<input type='text' name='name' id='name' className='input' />

						<label htmlFor='repo'>GitHub Repo</label>
						<input
							type='text'
							name='repo'
							id='repo'
							className='input'
							placeholder='username/cool-project'
						/>

						<label htmlFor='branch'>Branch</label>
						<input
							type='text'
							name='branch'
							id='branch'
							className='input'
							defaultValue='main'
						/>

						<label htmlFor='username'>GitHub Username</label>
						<input
							type='text'
							name='username'
							id='username'
							className='input'
						/>

						<label htmlFor='token'>GitHub Token</label>
						<p className='opacity-75'>
							Info: The token should at least have Read Access to a repository.
						</p>
						<p>
							See{' '}
							<a
								target='_blank'
								href='https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token'
								className='underline hover:text-zinc-300'
							>
								GitHub's docs
							</a>{' '}
							for more info on creating a token.
						</p>
						<input type='password' className='input' name='token' id='token' />

						<Switch
							label='Store password in database'
							name='store'
							id='storeToken'
						/>
						<p>
							Info: The token will be stored unencrypted in both your account
							and the project, however it can only be accessed by the RedDeploy
							System. If you want to store this token in your user account, this
							will automatically fill in the token field for you when creating a
							new project.
						</p>

						<Switch
							label='Enable proxy'
							checked={withProxy}
							onChange={(e) => setWithProxy(e)}
							name='proxy'
						/>
					</div>

					<AnimatePresence>
						{withProxy ? (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className='flex flex-col gap-2 mt-2'
							>
								<label htmlFor='proxyPort'>Port</label>
								<input
									type='number'
									name='port'
									id='proxyPort'
									className='input'
								/>

								<label htmlFor='domain'>Domain</label>

								<div className='flex flex-row gap-2'>
									<input
										type='text'
										name='domain'
										id='domain'
										className='input'
										placeholder='your-project.example.com'
									/>
								</div>
							</motion.div>
						) : null}
					</AnimatePresence>

					<button className='mt-2 w-full p-2 bg-zinc-800 hover:bg-green-600 rounded-lg text-center active:scale-95 transition-all duration-100'>
						Create!
					</button>
				</form>
			</div>
		</div>
	);
}
