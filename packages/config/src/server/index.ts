import express from 'express';
import { mkdir, writeFile } from 'fs/promises';
import { createServer } from 'http';
import { createHttpTerminator } from 'http-terminator';
import path from 'path';
import { Server as SocketServer } from 'socket.io';
import Dockerode from 'dockerode';
import { pullImage } from './lib/docker';

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
		if (blockConfig) {
			socket.emit('view', 'install');
			return;
		}
		blockConfig = true;

		socket.on('config', async (data) => {
			socket.emit('view', 'install');

			await writeFile(
				path.join(__dirname, '..', '..', 'data', 'config.json'),
				JSON.stringify(data, null, 2),
			);

			socket.emit('step', 'Pulling images... (1/4)');
			await pullImage('docker.io/mongo:4.2.17');

			socket.emit('step', 'Pulling images... (2/4)');
			await pullImage('ghcr.io/redcrafter07/deploy/cm:prod');

			socket.emit('step', 'Pulling images... (3/4)');
			await pullImage('ghcr.io/redcrafter07/deploy/web:prod');

			socket.emit('step', 'Pulling images... (4/4)');
			// await pullImage('ghcr.io/redcrafter07/deploy/proxy:prod');

			socket.emit('step', 'Creating network... (1/2)');
			await docker.createNetwork({
				Name: 'reddeploy',
				Attachable: true,
			});

			socket.emit('step', 'Creating network... (2/2)');
			await docker.createNetwork({
				Name: 'reddeploy-proxy',
				Attachable: true,
			});

			socket.emit('step', 'Creating volumes... (1/2)');
			await docker.createVolume({
				Name: 'reddeploy-mongo',
			});

			socket.emit('step', 'Creating volumes... (2/2)');
			await docker.createVolume({
				Name: 'reddeploy-cm-cache',
			});

			socket.emit('step', 'Creating containers... (1/4)');
			await docker.createContainer({
				Image: 'docker.io/mongo:4.2.17',
				name: 'reddeploy-mongo',
				Env: [
					'MONGO_INITDB_ROOT_USERNAME=root',
					'MONGO_INITDB_ROOT_PASSWORD=reddeploy',
				],
				HostConfig: {
					NetworkMode: 'reddeploy',
				},
				Volumes: {
					'/data/db': {
						Name: 'reddeploy-mongo',
					},
				},
			});

			socket.emit('step', 'Creating containers... (2/4)');
			await docker.createContainer({
				Image: 'ghcr.io/redcrafter07/deploy/cm:prod',
				name: 'reddeploy-cm',
				Env: [
					'CM_MONGO_HOST=reddeploy-mongo',
					'CM_MONGO_PORT=27017',
					'CM_MONGO_USER=root',
					'CM_MONGO_PASS=reddeploy',
					'CM_MONGO_DB=reddeploy',
					'CM_PORT=8080',
				],
				HostConfig: {
					NetworkMode: 'reddeploy',
					Binds: [
						'reddeploy-cm-cache:/app/cache',
						'/var/run/docker.sock:/var/run/docker.sock',
					],
				},
			});

			socket.emit('step', 'Creating containers... (3/4)');
			await docker.createContainer({
				Image: 'ghcr.io/redcrafter07/deploy/web:prod',
				name: 'reddeploy-web',
				Env: ['WEB_CM_HOST=reddeploy-cm', 'WEB_CM_PORT=8080', 'WEB_PORT=80'],
				HostConfig: {
					NetworkMode: 'reddeploy',
				},
			});

			socket.emit('step', 'Creating containers... (4/4)');
			/* await docker.createContainer({
				Image: 'ghcr.io/redcrafter07/deploy/proxy:prod',
				name: 'reddeploy-proxy',
				Env: [
					'PROXY_WEB_HOST=reddeploy-web',
					'PROXY_WEB_PORT=80',
					'PROXY_PORT=80',
				],
				HostConfig: {
					NetworkMode: 'reddeploy-proxy',
				},
			}); */

			socket.emit('step', 'Starting containers... (1/4)');
			await docker.getContainer('reddeploy-mongo').start();

			socket.emit('step', 'Starting containers... (2/4)');
			await docker.getContainer('reddeploy-cm').start();

			socket.emit('step', 'Starting containers... (3/4)');
			await docker.getContainer('reddeploy-web').start();

			socket.emit('step', 'Starting containers... (4/4)');
			// await docker.getContainer('reddeploy-proxy').start();

			// TODO: Import config to database

			socket.emit('step', 'Done! You can close this tab now.');
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
