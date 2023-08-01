import express from 'express';
import { mkdir, writeFile } from 'fs/promises';
import { createServer } from 'http';
import { createHttpTerminator } from 'http-terminator';
import path from 'path';
import { Server as SocketServer } from 'socket.io';
import Dockerode from 'dockerode';

const docker = new Dockerode({
	socketPath: '/var/run/docker.sock',
});

let blockConfig = false;

(async () => {
	const app = express();
	const server = createServer(app);
	const io = new SocketServer(server, {
		transports: ['websocket'],
	});

	const terminator = createHttpTerminator({ server });

	io.on('connect', (socket) => {
		if (blockConfig) return;
		blockConfig = true;

		socket.on('config', async (data) => {
			socket.emit('view', 'install');

			await writeFile(
				path.join(__dirname, '..', '..', 'data', 'config.json'),
				JSON.stringify(data, null, 2),
			);

			socket.emit('step', 'Pulling images... (1/4)');
			await docker.pull('mongo:4.2.17');

			socket.emit('step', 'Pulling images... (2/4)');
			await docker.pull('ghcr.io/RedCrafter07/deploy/cm');

			socket.emit('step', 'Pulling images... (3/4)');
			await docker.pull('ghcr.io/RedCrafter07/deploy/web');

			socket.emit('step', 'Pulling images... (4/4)');
			await docker.pull('ghcr.io/RedCrafter07/deploy/proxy');
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
