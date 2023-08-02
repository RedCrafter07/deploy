import { useState } from 'react';

const { io } = await import('socket.io-client');

export default function useSocket() {
	const [socket] = useState(
		io(window.location.origin, {
			transports: ['websocket'],
		}),
	);

	return socket;
}
