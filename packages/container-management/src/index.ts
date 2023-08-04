import { Server } from 'socket.io';
import { io as SocketClient } from 'socket.io-client';

const proxySocket = SocketClient('http://reddeploy-proxy:3000');

const io = new Server({
	transports: ['websocket'],
});

io.on('connect', (socket) => {
	socket.on(
		'add',
		(data: { ip: string; port: string; domain: string; name: string }) => {
			proxySocket.emit('addProject', data.ip, data.port, data.domain);
		},
	);
});

io.listen(8080);
console.log('CM socket listening');
