export default function Login() {
	return (
		<div className='min-h-screen bg-zinc-900 text-zinc-50'>
			<div className='container mx-auto p-2'>
				<h1>Login</h1>
				<p>Please log in to RedDeploy.</p>

				<form>
					<label htmlFor='username'>Username</label>
					<input type='text' name='username' id='username' />

					<label htmlFor='password'>Password</label>
					<input type='password' name='password' id='password' />
				</form>
			</div>
		</div>
	);
}
