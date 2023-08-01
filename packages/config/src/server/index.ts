import express from 'express';
import { mkdir, writeFile } from 'fs/promises';
import { createServer } from 'http';
import path from 'path';
import { Server as SocketServer } from 'socket.io';

(async () => {
	const app = express();
	const server = createServer(app);
	const io = new SocketServer(server, {
		transports: ['websocket'],
	});

	io.on('connect', (socket) => {
		socket.on('config', async (data) => {
			await writeFile(
				path.join(__dirname, '..', '..', 'data', 'config.json'),
				JSON.stringify(data, null, 2),
			);
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
		console.log('Config interface running on port 9272');
	});
})();
