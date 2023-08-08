import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { MongoClient } from 'mongodb';
import {
	createContainer,
	getContainer,
	getVolume,
	removeContainer,
	removeVolume,
	renameContainer,
	restartContainer,
	startContainer,
	stopContainer,
	waitForContainer,
} from '../../lib/docker.js';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import path from 'path';
import bcrypt from 'bcrypt';

const mongoURI = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}`;

const client = new MongoClient(mongoURI, {
	auth: {
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
	},
	directConnection: true,
});

const system = client.db('rd-system');
const project = client.db('project');

console.log('SCM started.');

console.log('Checking config...');

(async () => {
	if (await existsSync('/data/config.json')) {
		console.log('Config detected!');

		console.log('Reading config...');

		interface Config {
			domain: string;
			username: string;
			password: string;
			proxy: 'NGINX Proxy Manager' | 'NGINX';
			prefix: string;
			mail: string;
		}

		const config = JSON.parse(
			await readFile('/data/config.json', 'utf-8'),
		) as Config;
		const containers = JSON.parse(
			await readFile('/data/containers.json', 'utf-8'),
		);

		console.log('Connecting to database...');

		await client.connect();

		console.log('Initializing databases...');

		console.log('Writing system containers...');

		await system.collection('containers').insertOne(containers);

		console.log('Writing users...');

		console.log('Hashing password...');

		const password = await bcrypt.hashSync(config.password, 10);

		await system.collection('users').insertOne({
			username: config.username,
			password,
			admin: true,
		});

		console.log('Writing config...');

		await system.collection('config').insertOne({
			accessURL: config.domain,
			proxy: config.proxy,
			prefix: config.prefix,
			proxyConfigured: false,
			adminEmail: config.mail,
		});

		console.log("Rename SCM container to 'reddeploy-scm-old'...");

		await renameContainer('reddeploy-scm', 'reddeploy-scm-old');

		console.log('Create new SCM container without volume...');

		const id = await createContainer({
			Image:
				process.env.ENV == 'dev'
					? 'reddeploy/scm:latest'
					: 'ghcr.io/redcrafter07/deploy/scm:prod',
			Name: 'reddeploy-scm',
			HostConfig: {
				NetworkMode: 'reddeploy',
				Binds: [
					'/var/run/docker.sock:/var/run/docker.sock',
					'reddeploy-scm-cache:/cache',
				],
				RestartPolicy: {
					Name: 'always',
				},
				PortBindings: {
					'9272/tcp': [
						{
							HostPort: '9272',
						},
					],
				},
			},
			Env: [
				'DB_HOST=reddeploy-mongo',
				'DB_PORT=27017',
				'DB_USER=root',
				'DB_PASS=reddeploy',
				'DB_NAME=reddeploy',
			],
		});

		console.log('Writing new container...');

		const { _id, ...oldContainers } = (await system
			.collection('containers')
			.findOne())!;
		const newContainers = {
			...oldContainers,
			scm: id,
		};

		await system.collection('containers').deleteMany();
		await system.collection('containers').insertOne(newContainers);

		await startContainer(id);

		console.log('New container started!');

		console.log('Removing & exiting...');

		client.close();

		await stopContainer('reddeploy-scm-old');
	} else {
		console.log('Config not detected! Checking for volume...');

		if (await getVolume('reddeploy_config')) {
			console.log('Volume found! Removing...');

			console.log('Waiting for old container to stop...');

			await waitForContainer('reddeploy-scm-old');

			console.log('Removing old container...');

			await removeContainer('reddeploy-scm-old');

			console.log('Removing volume...');

			await removeVolume('reddeploy_config');
			console.log('Volume removed!');
		} else console.log('Volume not detected! Skipping postinstall...');

		console.log('Checking database availability...');

		const dbContainer = await getContainer('reddeploy-mongo');

		if (!dbContainer?.State.Running) {
			console.log('Running startup mode...');

			console.log('Getting cached containers...');

			const containers = JSON.parse(
				await readFile('/cache/containers.json', 'utf-8'),
			);

			const containerArray = [
				...new Set([
					'db',
					...Object.keys(containers).filter(
						(c) => c != 'scm' && c != '_id' && c != 'proxy',
					),
				]),
			];

			console.log(
				`Starting ${containerArray} containers: ${containerArray.join(', ')}`,
			);

			await Promise.all(
				containerArray.map(async (c) => {
					const id = containers[c];

					console.log(`Starting ${c} with ID ${c}...`);

					await startContainer(id);
				}),
			);

			const webIP = (await getContainer(containers.web))!.NetworkSettings
				.Networks.reddeploy.IPAddress;

			await system.collection('config').findOneAndUpdate(
				{},
				{
					$set: {
						webIP,
					},
				},
			);

			console.log('Starting proxy...');

			await startContainer(containers.proxy);

			console.log('Containers started! Restarting SCM container...');

			// await restartContainer('reddeploy-scm');
			process.exit(0);
		}

		await initWebServer();
	}
})();

async function initWebServer() {
	console.log('Connecting to database...');

	await client.connect();

	console.log(await system.collection('config').findOne());

	console.log('Writing containers to cache...');

	await writeFile(
		'/cache/containers.json',
		JSON.stringify(await system.collection('containers').findOne()),
	);

	console.log('Checking if Proxy is set up...');

	let proxySetUp = false;

	const config = await system.collection('config').findOne();

	if (config?.proxyConfigured) proxySetUp = true;

	if (!proxySetUp) console.log('Setup not detected!');

	console.log('Initializing web server...');

	const app = express();
	const server = createServer(app);
	const io = new SocketServer(server, {
		transports: ['websocket'],
	});

	io.on('connect', (socket) => {
		socket.on('from', (data: string) => {
			if (data == 'config') socket.emit('reload');
		});
		socket.on('login', async (username: string, password: string) => {
			const u = await system
				.collection('users')
				.findOne({ username, password, admin: true });

			if (!u) return socket.emit('login', false);

			socket.emit('login', true);

			socket.data.username = username;
			socket.data.loggedIn = true;

			socket.on('logout', () => {
				socket.data = {};

				socket.emit('logout');
			});

			socket.on('getContainers', async () => {
				const containers = await system.collection('containers').findOne();

				const { _id, ...c } = containers!;

				const containerData = await Promise.all(
					Object.values(c).map(async (c) => (await getContainer(c))!),
				);

				const mappedData = containerData.map((c) => ({
					name: c?.Name,
					id: c?.Id,
					running: c?.State.Running,
				}));

				socket.emit('getContainers', mappedData);
			});

			socket.on('stop all', async () => {
				console.log('Stop all requested by user. Stopping all containers...');

				const containers = await system.collection('containers').findOne();

				await writeFile('/cache/containers.json', JSON.stringify(containers));

				const { _id, ...c } = containers!;

				await Promise.all(
					Object.keys(c)
						.filter((c) => c != 'scm')
						.map((name) => ({ id: c[name], name }))
						.map(async ({ name, id }) => {
							io.emit('stop', `Stopping ${name}...`);
							console.log(`Stopping ${name}...`);
							await stopContainer(id);
						}),
				);

				console.log('Shutting down SCM...');

				socket.emit('stop all');

				await timeout(500);

				console.log('Bye!');

				await stopContainer('reddeploy-scm');
			});

			socket.on(
				'npm config',
				async (data: { url: string; email: string; password: string }) => {
					if (proxySetUp) return socket.emit('reload');

					const { url, email, password } = data;

					await system.collection('config').updateOne(
						{},
						{
							$set: {
								npm: {
									url,
									email,
									password,
								},
								proxyConfigured: true,
							},
						},
					);

					proxySetUp = true;

					const webIP = (await getContainer('reddeploy-web'))!.NetworkSettings
						.Networks.reddeploy.IPAddress;

					const { adminEmail } = (await system.collection('config').findOne())!;

					await system.collection('config').findOneAndUpdate(
						{},
						{
							$set: {
								webIP,
							},
						},
					);

					const proxyContainer = await createContainer({
						Name: 'reddeploy-proxy',
						Image:
							process.env.ENV == 'dev'
								? 'reddeploy/proxy:latest'
								: 'ghcr.io/redcrafter07/deploy/proxy:prod',
						Env: [
							`MONGO_URL=${mongoURI}`,
							`MONGO_USER=${process.env.DB_USER}`,
							`MONGO_PASSWORD=${process.env.DB_PASS}`,
							`MAIL=${adminEmail}`,
						],
						HostConfig: {
							NetworkMode: 'reddeploy',
						},
					});

					await startContainer(proxyContainer);

					await system.collection('containers').updateOne(
						{},
						{
							$set: {
								proxy: proxyContainer,
							},
						},
					);

					await writeFile(
						'/cache/containers.json',
						JSON.stringify(await system.collection('containers').findOne()),
					);

					socket.emit('reload');
				},
			);
		});
	});

	app.use('/.rd-scm', express.static(path.join(__dirname, '..', 'client')));

	app.get('/', (_, res) => {
		if (!proxySetUp) return res.redirect('/setup-proxy');
		res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
	});

	app.get('/setup-proxy', (_, res) => {
		if (proxySetUp) return res.redirect('/');
		res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
	});

	app.get('*', (_, res) => {
		res.redirect('/');
	});

	console.log('Starting listening on port 9272...');

	server.listen(9272, () => {
		console.log('Started webserver!');
	});
}

async function timeout(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
