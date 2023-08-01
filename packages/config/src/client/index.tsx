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

				<h3 className='text-xl'>1. Access URL</h3>
				<p>
					Let's configure your Access URL first. You should choose a domain
					name, like <code>rd.example.com</code>.
				</p>

				<input type='text' name='domain' placeholder='rd.example.com' />
			</div>
		</div>
	);
}

ReactDOM.createRoot(document.querySelector('#root')!).render(<App />);
