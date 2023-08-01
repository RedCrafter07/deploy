import React, { useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket() {
	const [socket] = useState(
		io(window.location.origin, {
			transports: ['websocket'],
			reconnection: true,
		}),
	);

	return socket;
}
