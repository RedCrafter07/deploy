import { Server } from 'socket.io';
import { io as SocketClient } from 'socket.io-client';

const ProxySocket = SocketClient('http://reddeploy-proxy:3000');

const io = new Server({
	transports: ['websocket'],
});

io.on('connect', (socket) => {
	socket.on('add', (name: string, port: string, domain: string) => {});
});

io.listen(8080);
console.log('CM socket listening');
