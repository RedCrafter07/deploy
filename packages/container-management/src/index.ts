import { Server } from 'socket.io';
import { io as SocketClient } from 'socket.io-client';
import { MongoClient } from 'mongodb';
import {
	buildImage,
	createContainer,
	getContainer,
	removeContainer,
	startContainer,
	stopContainer,
} from '../lib/docker';

const proxySocket = SocketClient('http://reddeploy-proxy:3000', {
	autoConnect: true,
	reconnection: true,
});

const mongoURI = `mongodb://${process.env.CM_MONGO_HOST}:${process.env.CM_MONGO_PORT}`;

const mongo = new MongoClient(mongoURI, {
	auth: {
		username: process.env.CM_MONGO_USER!,
		password: process.env.CM_MONGO_PASS!,
	},
});

interface Project {
	_id: string;
	name: string;
	image: string;
	container: string;
	host: {
		ip: string;
		port: string;
		domain: string;
	};
}

(async () => {
	await mongo.connect();

	console.log('Connected to database!');

	console.log('Starting projects...');

	const projectDb = mongo.db('project');
	const projects = await projectDb.collection('projects').find();

	for await (const project of projects) {
		console.log(`Starting container ${project.container}`);
		await startContainer(project.container);
	}

	const io = new Server({
		transports: ['websocket'],
	});

	io.on('connect', (socket) => {
		socket.on(
			'add',
			async (data: {
				name: string;
				repo: {
					name: string;
					branch: string;
					token: string;
					username: string;
				};
				host: { port: string; domain: string };
			}) => {
				const { host: preBuildHost, repo } = data;

				console.log('Building image for project "' + data.name + '"');

				const image = await buildGithub(
					repo.name,
					repo.branch,
					repo.username,
					repo.token,
				);

				const prefix = (await mongo
					.db('rd-system')
					.collection('config')
					.findOne())!.prefix as string;

				console.log('Creating container...');

				const container = (await createContainer({
					Image: image,
					Name: `${prefix}-${data.name.replace(' ', '_').toLowerCase()}`,
				})) as string;

				console.log('Starting container...');

				await startContainer(container);

				console.log('Getting IP...');

				const containerData = (await getContainer(container))!;
				const ip = containerData.NetworkSettings.Networks.bridge.IPAddress;

				const host = {
					...preBuildHost,
					ip,
				};

				console.log('Writing new project to database...');

				const project = mongo.db('project');

				const mongoData = {
					name: data.name,
					image,
					container,
					host,
				};

				const { insertedId } = await project
					.collection('projects')
					.insertOne(mongoData);

				console.log('Sending data to proxy...');

				proxySocket.emit('addProject', host.ip, host.port, host.domain);

				socket.emit('add', insertedId);
			},
		);

		socket.on('remove', async (id: string) => {
			const projectDb = mongo.db('project');
			const project = (await projectDb.collection('projects').findOne({
				_id: {
					equals: id,
				},
			})) as Project | null;

			if (!project) {
				socket.emit('remove', false);
				return;
			}

			const { container, host } = project;

			console.log('Checking for container...');

			const containerData = await getContainer(container);

			if (!containerData) {
				console.log("Container doesn't exist");
				socket.emit('remove', false);
				return;
			}

			console.log('Stopping container...');
			await stopContainer(container);

			console.log('Removing container...');
			await removeContainer(container);

			console.log('Removing project from database...');
			await projectDb.collection('projects').deleteOne({
				_id: {
					equals: id,
				},
			});

			console.log('Sending data to proxy...');

			proxySocket.emit('deleteProject', host.domain);

			socket.emit('remove', true);
		});
	});

	io.listen(parseInt(process.env.CM_PORT!));
	console.log('CM socket listening');

	// prevent stop until containers are stopped
	process.on('SIGINT', async () => {
		const projectDb = mongo.db('project');
		const projects = await projectDb.collection('projects').find();

		console.log('Stopping all containers...');

		for await (const project of projects) {
			console.log(`Stopping container ${project.container}`);
			await stopContainer(project.container);
		}

		process.exit(0);
	});
})();

async function buildGithub(
	repo: string,
	branch: string,
	username: string,
	token: string,
) {
	const encodedToken = encodeURIComponent(token);
	const gitUrl = `https://${username}:${encodedToken}@github.com/${repo}#${branch}`;
	const imageName = `rd-${repo.replace('/', '-')}:latest`;

	await buildImage({
		name: imageName,
		remote: gitUrl,
	});

	return imageName;
}

function generateToken(length: number) {
	const chars =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	let token = '';

	for (let i = 0; i < length; i++) {
		token += chars[Math.floor(Math.random() * chars.length)];
	}

	return token;
}
