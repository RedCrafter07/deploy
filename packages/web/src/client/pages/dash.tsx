import { useEffect, useState } from 'react';
import useSocket from '../util/useSocket';

export default function Dash() {
	const socket = useSocket();
	const [user, setUser] = useState<{ username: string; admin: boolean }>();

	useEffect(() => {
		socket.on('user', (user) => {
			setUser(user);
		});
		socket.connect();
	}, []);

	return (
		<div className='min-h-screen bg-zinc-900 text-zinc-50'>
			<div className='container mx-auto'></div>
		</div>
	);
}
