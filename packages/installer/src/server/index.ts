import express from 'express';
import { mkdir, writeFile } from 'fs/promises';
import { createServer } from 'http';
import path from 'path';
import { Server as SocketServer } from 'socket.io';
import Dockerode from 'dockerode';

const docker = new Dockerode({
	socketPath: '/var/run/docker.sock',
});

(async () => {
	const app = express();
	const server = createServer(app);
	const io = new SocketServer(server, {
		transports: ['websocket'],
	});

	io.on('connect', (socket) => {
		socket.on('from', (data: string) => {
			if (data == 'config') socket.emit('reload');
		});
	});

	await mkdir(path.join(__dirname, '..', '..', 'data'), { recursive: true });

	app.use('/.rd', express.static(path.join(__dirname, '..', 'client')));

	app.get('/', (req, res) => {
		res.sendFile(
			path.join(__dirname, '..', '..', 'src', 'client', 'index.html'),
		);
	});
	app.get('*', (req, res) => {
		res.redirect('/');
	});

	server.listen(9272, () => {
		console.log('Installer screen running on port 9272');
	});
})();
