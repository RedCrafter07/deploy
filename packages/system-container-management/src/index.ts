import { Server } from 'socket.io';

const io = new Server({
	transports: ['websocket'],
});

console.log('SCM socket listening');
