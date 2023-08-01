import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/figtree';
import '@fontsource/figtree/900.css';
import './index.css';

function App() {
	return (
		<div className='bg-zinc-800 text-zinc-100 min-h-screen'>
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

						console.log(data);
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
						additional Admin Users.
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
					<p>Configure your proxy for Project URLs!</p>

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
				</form>
			</div>
		</div>
	);
}

ReactDOM.createRoot(document.querySelector('#root')!).render(<App />);
