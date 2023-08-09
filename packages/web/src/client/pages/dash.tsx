import { useEffect, useState } from 'react';
import useSocket from '../util/useSocket';

export default function Dash() {
	const socket = useSocket();
	const [user, setUser] = useState<{ username: string; admin: boolean }>();
	const [projects, setProjects] = useState([]);

	useEffect(() => {
		socket.on('user', (user) => {
			setUser(user);
			socket.emit('getProjects');
		});

		socket.on('projects', (projects) => {
			setProjects(projects);
			console.log(projects);
		});

		socket.connect();
	}, []);

	return (
		<div className='min-h-screen bg-zinc-900 text-zinc-50'>
			<div className='container mx-auto p-2'>
				<h1 className='text-3xl'>Hello, {user?.username}!</h1>
			</div>
		</div>
	);
}
