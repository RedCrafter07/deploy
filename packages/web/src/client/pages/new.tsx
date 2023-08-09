import { useEffect } from 'react';
import useSocket from '../util/useSocket';
import Switch from '../components/Switch';

export default function New() {
	const socket = useSocket();

	useEffect(() => {
		socket.connect();
	}, []);

	return (
		<div className='min-h-screen bg-zinc-900 text-zinc-50'>
			<div className='container mx-auto p-2'>
				<h1 className='text-3xl'>Create a new project</h1>

				<form
					onSubmit={(e) => {
						e.preventDefault();
					}}
				>
					<Switch label='Enable proxy' defaultChecked name='proxy' />
				</form>
			</div>
		</div>
	);
}
