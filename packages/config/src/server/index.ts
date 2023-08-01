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

(async () => {
	const app = express();
	const server = createServer(app);
	const io = new SocketServer(server, {
		transports: ['websocket'],
	});

	const terminator = createHttpTerminator({ server });

	io.on('connect', (socket) => {
		socket.on('config', async (data) => {
			await writeFile(
				path.join(__dirname, '..', '..', 'data', 'config.json'),
				JSON.stringify(data, null, 2),
			);

			socket.emit('step', 'Pulling installer image...');

			await docker.pull('ghcr.io/RedCrafter07/deploy/installer');

			socket.emit('step', 'Starting installer container...');

			const container = await docker.createContainer({
				Image: 'ghcr.io/RedCrafter07/deploy/installer',
				Env: [`INSTALL_DIR=${data.install}`, `HAS_PROXY=${data.proxy}`],
				ExposedPorts: {
					'9272/tcp': {
						HostPort: '9272',
					},
				},
				HostConfig: {
					Binds: [
						`${data.install}:/install`,
						'/var/run/docker.sock:/var/run/docker.sock',
					],
				},
			});

			await terminator.terminate();

			await container.start();

			process.exit(0);
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
