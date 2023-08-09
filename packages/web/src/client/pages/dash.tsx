import { useEffect, useState } from 'react';
import useSocket from '../util/useSocket';
import { ProjectData } from '../../server';

interface DbProject extends ProjectData {
	_id: string;
}

export default function Dash() {
	const socket = useSocket();
	const [user, setUser] = useState<{ username: string; admin: boolean }>();
	const [projects, setProjects] = useState<DbProject[]>([]);

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

				<div className='grid gap-4 lg:grid-cols-3'>
					{projects.map((project) => (
						<div
							className='bg-zinc-800 rounded-lg shadow-md p-4'
							key={project._id}
						>
							<h2 className='text-2xl'>{project.name}</h2>
							<p className='text-zinc-200'>Repo: {project.repo.name}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
