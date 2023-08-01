import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/figtree';
import '@fontsource/figtree/700.css';
import '@fontsource/figtree/900.css';
import './index.css';
import useSocket from './util/useSocket';
import Spinner from './components/Spinner';

function App() {
	const socket = useSocket();

	type View = 'config' | 'install' | 'done';
	const [view, setView] = useState<View>('config');
	const [step, setStep] = useState<string>('Initializing...');

	useEffect(() => {
		socket.on('connect', () => {
			console.log('[SOCKET]: Connected!');
		});

		socket.on('reload', () => {
			window.location.reload();
		});

		socket.on('view', (view: View) => setView(view));

		socket.on('step', (step: string) => setStep(step));

		socket.connect();
	}, []);

	const Config = () => {
		return (
			<div className='container mx-auto p-2'>
				<h1 className='text-3xl'>Welcome to the RedDeploy Configuration!</h1>
				<p>
					This is the configuration for the start of RedDeploy. You'll be able
					to change these options later.
				</p>

				<div className='my-4' />

				<form
					onSubmit={(e) => {
						e.preventDefault();

						const data = new FormData(e.target as HTMLFormElement);

						const domain = data.get('domain') as string;
						const username = data.get('username') as string;
						const password = data.get('password') as string;
						const proxy = data.get('proxy') as string;
						const prefix = data.get('prefix') as string;

						socket.emit('config', {
							domain,
							username,
							password,
							proxy,
							prefix,
						});
					}}
				>
					<h3 className='text-xl'>1. Access URL</h3>
					<p>
						Let's configure your Access URL first. You should choose a domain
						name, like <code>rd.example.tld</code>.
					</p>

					<div className='my-2' />

					<input
						type='text'
						name='domain'
						placeholder='rd.example.com'
						className='input'
					/>

					<div className='my-4' />

					<h3 className='text-xl'>2. Admin User</h3>
					<p>
						Now, we need to create the administrator user. This user will have
						full access to RedDeploy. You can create more users later, including
						additional Admin Users.{' '}
						<span className='font-bold'>
							Make sure to save these credentials!
						</span>
					</p>

					<div className='my-2' />

					<input
						type='text'
						name='username'
						placeholder='Username'
						className='input'
					/>

					<div className='my-2' />

					<input
						type='password'
						name='password'
						placeholder='Password'
						className='input'
					/>

					<div className='my-4' />

					<h3 className='text-xl'>3. Proxy</h3>
					<p>
						Configure your reverse proxy for Project URLs.{' '}
						<a
							href='https://www.wikiwand.com/en/Reverse_proxy'
							className='underline'
							target='_blank'
						>
							Learn more about reverse proxies
						</a>
					</p>

					<div className='my-2' />

					<div className='flex flex-row gap-2'>
						<input
							type='radio'
							name='proxy'
							value='NGINX Proxy Manager'
							className='input-radio'
							defaultChecked
						/>
						<label className='input-label'>
							An existing{' '}
							<a href='https://nginxproxymanager.com/' className='underline'>
								NGINX Proxy Manager
							</a>{' '}
							instance
						</label>
					</div>

					<div className='flex flex-row gap-2'>
						<input
							type='radio'
							name='proxy'
							value='NGINX'
							className='input-radio'
							disabled
						/>
						<label className='input-label'>
							An additional NGINX proxy instance (coming soon)
						</label>
					</div>

					<div className='my-4' />

					<h3 className='text-xl'>4. Container prefix</h3>
					<p>
						This is the prefix RedDeploy will add automatically to project
						containers. For example, if you set this to <code>rd</code>, a
						project named <code>test</code> will have the container name{' '}
						<code>rd-test</code>.
					</p>

					<div className='my-2' />

					<input
						type='text'
						name='prefix'
						placeholder='Prefix'
						className='input'
						defaultValue='rd'
					/>

					<div className='my-4' />

					<h3 className='text-xl'>5. Finish configuration!</h3>
					<p>
						You're almost done! Just click the button below to finish the
						configuration.
					</p>

					<div className='my-2' />

					<button type='submit' className=''>
						Finish configuration
					</button>
				</form>
			</div>
		);
	};

	return (
		<div className='bg-zinc-800 text-zinc-100 min-h-screen'>
			{view === 'config' && <Config />}
			{view === 'install' && (
				<div className='w-full h-full grid place-items-center'>
					<div className='flex flex-col gap-2'>
						<h1 className='text-3xl'>Installing RedDeploy...</h1>
						<p>RedDeploy is being installed. This might take a few minutes.</p>
						<Spinner />
						<p>{step}</p>
					</div>
				</div>
			)}
		</div>
	);
}

ReactDOM.createRoot(document.querySelector('#root')!).render(<App />);
