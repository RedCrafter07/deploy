import express from 'express';
import { mkdir, writeFile } from 'fs/promises';
import { createServer } from 'http';
import path from 'path';
import { Server as SocketServer } from 'socket.io';
import Dockerode from 'dockerode';
import { v2 as compose } from 'docker-compose';
import axios from 'axios';

const docker = new Dockerode({
	socketPath: '/var/run/docker.sock',
});

let step: string = 'Fetching compose file...';

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

		socket.emit('step', step);
	});

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

	await startInstall();

	async function startInstall() {
		await mkdir(process.env.INSTALL_DIR as string, { recursive: true });

		step = 'Fetching compose file...';
		io.emit('step', step);

		const baseURL =
			'https://raw.githubusercontent.com/RedCrafter07/deploy/main';
		const composeURL =
			process.env.HAS_PROXY == 'true'
				? baseURL + '/docker-compose.yml'
				: baseURL + '/docker-compose.no-proxy.yml';

		const { data: composeFile } = await axios.get(composeURL);

		step = 'Writing compose file...';
		io.emit('step', step);

		await writeFile(
			path.join(process.env.INSTALL_DIR as string, 'docker-compose.yml'),
			composeFile,
		);

		step = 'Pulling images...';
		io.emit('step', step);

		await compose.pullAll({
			cwd: process.env.INSTALL_DIR as string,
		});

		step = 'Starting containers...';
		io.emit('step', step);

		await compose.upAll({
			cwd: process.env.INSTALL_DIR as string,
		});

		step = 'Done!';
		io.emit('step', step);
	}
})();
