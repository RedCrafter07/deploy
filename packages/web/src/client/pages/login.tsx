export default function Login() {
	return (
		<div className='min-h-screen bg-zinc-900 text-zinc-50'>
			<div className='container mx-auto p-2'>
				<h1 className='text-3xl'>Login</h1>
				<h3 className='text-xl'>Please log in to RedDeploy.</h3>

				<form>
					<label htmlFor='username'>Username</label>
					<input className='input' type='text' name='username' id='username' />

					<label htmlFor='password'>Password</label>
					<input
						className='input'
						type='password'
						name='password'
						id='password'
					/>
				</form>
			</div>
		</div>
	);
}
