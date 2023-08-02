import express from 'express';
import { mkdir, writeFile } from 'fs/promises';
import { createServer } from 'http';
import { createHttpTerminator } from 'http-terminator';
import path from 'path';
import { Server as SocketServer } from 'socket.io';
import {
	createContainer,
	createNetwork,
	createVolume,
	pullImage,
	startContainer,
} from './lib/docker';

let blockConfig = false;
let step: string;

const prodImages = {
	web: 'ghcr.io/redcrafter07/deploy/web:prod',
	cm: 'ghcr.io/redcrafter07/deploy/cm:prod',
	scm: 'ghcr.io/redcrafter07/deploy/scm:prod',
	proxy: 'ghcr.io/redcrafter07/deploy/proxy:prod',
	mongo: 'docker.io/mongodb/mongodb-community-server:4.4.10-ubi8',
};

const devImages = {
	web: 'reddeploy/web:latest',
	cm: 'reddeploy/cm:latest',
	scm: 'reddeploy/scm:latest',
	proxy: 'reddeploy/proxy:latest',
	mongo: 'docker.io/mongodb/mongodb-community-server:4.4.10-ubi8',
};

const images = process.env.ENV == 'dev' ? devImages : prodImages;

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
			socket.emit('step', step);
		}

		socket.on('config', async (data) => {
			if (blockConfig) return;

			blockConfig = true;
			io.emit('view', 'install');

			await writeFile(
				path.resolve('/data/config.json'),
				JSON.stringify(data, null, 2),
			);

			if (process.env.ENV != 'dev') {
				step = 'Pulling images... (1/5)';
				io.emit('step', step);
				await pullImage(images.mongo);

				step = 'Pulling images... (2/5)';
				io.emit('step', step);
				await pullImage(images.cm);

				step = 'Pulling images... (3/5)';
				io.emit('step', step);
				await pullImage(images.web);

				step = 'Pulling images... (4/5)';
				io.emit('step', step);
				await pullImage(images.scm);

				step = 'Pulling images... (5/5)';
				io.emit('step', step);
				// await pullImage('ghcr.io/redcrafter07/deploy/proxy:prod');
			}

			step = 'Creating network... (1/2)';
			io.emit('step', step);
			await createNetwork('reddeploy');

			step = 'Creating network... (2/2)';
			io.emit('step', step);
			await createNetwork('reddeploy-proxy');

			step = 'Creating volumes... (1/4)';
			io.emit('step', step);
			await createVolume('reddeploy-mongo');

			step = 'Creating volumes... (2/4)';
			io.emit('step', step);
			await createVolume('reddeploy-cm-cache');

			step = 'Creating volumes... (3/4)';
			io.emit('step', step);
			await createVolume('reddeploy-scm-cache');

			step = 'Creating volumes... (4/4)';
			io.emit('step', step);
			await createVolume('reddeploy-mongo-config');

			step = 'Creating containers... (1/5)';
			io.emit('step', step);
			const db = await createContainer({
				Image: images.mongo,
				Name: 'reddeploy-mongo',
				Env: [
					'MONGODB_INITDB_ROOT_USERNAME=root',
					'MONGODB_INITDB_ROOT_PASSWORD=reddeploy',
				],
				HostConfig: {
					NetworkMode: 'reddeploy',
					Binds: [
						'reddeploy-mongo:/data/db',
						'reddeploy-mongo-config:/data/configdb',
					],
				},
			});

			step = 'Creating containers... (2/5)';
			io.emit('step', step);
			const cm = await createContainer({
				Image: images.cm,
				Name: 'reddeploy-cm',
				Env: [
					'CM_MONGO_HOST=reddeploy-mongo',
					'CM_MONGO_PORT=27017',
					'CM_MONGO_USER=root',
					'CM_MONGO_PASS=reddeploy',
					'CM_PORT=8080',
				],
				HostConfig: {
					NetworkMode: 'reddeploy',
					Binds: [
						'reddeploy-cm-cache:/cache',
						'/var/run/docker.sock:/var/run/docker.sock',
					],
				},
			});

			step = 'Creating containers... (3/5)';
			io.emit('step', step);
			const web = await createContainer({
				Image: images.web,
				Name: 'reddeploy-web',
				Env: [
					'WEB_CM_HOST=reddeploy-cm',
					'WEB_CM_PORT=8080',
					'WEB_PORT=80',
					'DB_HOST=reddeploy-mongo',
					'DB_PORT=27017',
					'DB_USER=root',
					'DB_PASS=reddeploy',
					'DB_NAME=reddeploy',
				],
				HostConfig: {
					NetworkMode: 'reddeploy',
				},
			});

			step = 'Creating containers... (4/5)';
			io.emit('step', step);
			const scm = await createContainer({
				Image: images.scm,
				Name: 'reddeploy-scm',
				HostConfig: {
					NetworkMode: 'reddeploy',
					Binds: [
						'/var/run/docker.sock:/var/run/docker.sock',
						// 'reddeploy-scm-cache:/cache',
						'reddeploy_config:/data',
					],
				},
				Env: [
					'DB_HOST=reddeploy-mongo',
					'DB_PORT=27017',
					'DB_USER=root',
					'DB_PASS=reddeploy',
				],
			});

			step = 'Creating containers... (4/5)';
			io.emit('step', step);
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

			step = "Writing container ID's to file...";
			io.emit('step', step);

			await writeFile(
				path.resolve('/data/containers.json'),
				JSON.stringify({
					db,
					cm,
					web,
					scm,
					// proxy: proxy.id,
				}),
			);

			step = 'Starting containers... (1/5)';
			io.emit('step', step);
			await startContainer(db);

			step = 'Starting containers... (2/5)';
			io.emit('step', step);
			await startContainer(cm);

			step = 'Starting containers... (3/5)';
			io.emit('step', step);
			await startContainer(web);

			step = 'Starting containers... (4/5)';
			io.emit('step', step);
			await startContainer(scm);

			step = 'Starting containers... (5/5)';
			io.emit('step', step);
			// await docker.getContainer('reddeploy-proxy').start();

			// TODO: Import config to database

			step = 'Done!';
			io.emit('step', step);
			socket.emit('view', 'done');

			setTimeout(() => {
				process.exit(0);
			}, 500);
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
