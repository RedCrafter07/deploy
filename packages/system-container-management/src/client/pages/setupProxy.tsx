export default function SetupProxy() {
	return (
		<div className='bg-zinc-800'>
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

				<p>Navigate to your NPM Instance and go to "Users"</p>
				<p>Create a new user and save its credentials</p>
				<p>
					Only needed "manage permissions" for "Proxy Hosts" and "SSL
					Certificates", no Admin Privileges needed!
				</p>
				<p>Now, enter the Nginx Proxy Manager Access URL:</p>

				<div className='my-4' />

				<input type='text' className='input' placeholder='npm.example.com' />
			</div>
		</div>
	);
}
