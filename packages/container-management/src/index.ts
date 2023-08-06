import { Server } from 'socket.io';
import { io as SocketClient } from 'socket.io-client';
import { MongoClient, ObjectId } from 'mongodb';
import {
	buildImage,
	createContainer,
	getContainer,
	removeContainer,
	startContainer,
	stopContainer,
} from '../lib/docker';
import { readFile, writeFile } from 'fs/promises';
import Scheduler from '../lib/scheduler';

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
	withProxy: boolean;
	host?: {
		ip: string;
		port: string;
		domain: string;
	};
}

const scheduler = new Scheduler();

(async () => {
	await mongo.connect();

	console.log('Connected to database!');

	console.log('Starting projects...');

	const projectDb = mongo.db('project');
	const projects = await projectDb.collection('projects').find();

	for await (const project of projects) {
		console.log(`Starting container ${project.container}`);
		await startContainer(project.container);

		if (project.withProxy && project.host) {
			console.log("Getting container's IP...");

			const containerData = (await getContainer(project.container))!;
			const ip = containerData.NetworkSettings.Networks.bridge.IPAddress;

			console.log('Sending data to proxy...');

			proxySocket.emit(
				'editProject',
				ip,
				project.host.port,
				project.host.domain,
			);

			console.log("Updating project's IP...");

			await projectDb.collection('projects').updateOne(
				{
					_id: {
						equals: project._id,
					},
				},
				{
					$set: {
						host: {
							...project.host,
							ip,
						},
					},
				},
			);
		}

		console.log('Done!');
	}

	const io = new Server({
		transports: ['websocket'],
	});

	interface ProjectData {
		name: string;
		repo: {
			name: string;
			branch: string;
			token: string;
			username: string;
		};
		withProxy: boolean;
		host?: { port: string; domain: string };
	}

	io.on('connect', (socket) => {
		socket.on('add', async (data: ProjectData) => {
			scheduler.addTask(addProject(data));
		});

		socket.on('get all', async () => {
			const projectDb = mongo.db('project');
			const projects = await projectDb.collection('projects').find().toArray();

			socket.emit('get all', projects);
		});

		socket.on('remove', async (id: string) => {
			const projectDb = mongo.db('project');
			const project = (await projectDb.collection('projects').findOne({
				_id: {
					$eq: new ObjectId(id),
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

			if (host) {
				console.log('Sending data to proxy...');

				proxySocket.emit('deleteProject', host.domain);
			}

			console.log('Writing to cache...');

			await writeFile(
				'/cache/projects.json',
				JSON.stringify(await projectDb.collection('projects').find().toArray()),
			);

			socket.emit('remove', true);
		});
	});

	io.listen(parseInt(process.env.CM_PORT!));
	console.log('CM socket listening');

	// prevent stop until containers are stopped
	process.on('SIGINT', async () => {
		const projects = JSON.parse(
			await readFile('/cache/projects.json', 'utf-8'),
		);

		console.log('Stopping all containers...');

		for await (const project of projects) {
			console.log(`Stopping container ${project.container}`);
			await stopContainer(project.container);
		}

		process.exit(0);
	});

	async function addProject(data: ProjectData) {
		const { host: preBuildHost, repo } = data;

		console.log(`Building image for project "${data.name}"`);

		const image = await buildGithub(
			repo.name,
			repo.branch,
			repo.username,
			repo.token,
		);

		const prefix = (await mongo.db('rd-system').collection('config').findOne())!
			.prefix as string;

		console.log('Creating container...');

		const container = (await createContainer({
			Image: image,
			Name: `${prefix}-${data.name.replace(' ', '_').toLowerCase()}`,
		})) as string;

		console.log('Starting container...');

		await startContainer(container);

		let host: Project['host'] | undefined;

		if (data.withProxy && preBuildHost) {
			console.log('Getting IP...');

			const containerData = (await getContainer(container))!;
			const ip = containerData.NetworkSettings.Networks.bridge.IPAddress;

			host = {
				...preBuildHost,
				ip,
			};
		}

		console.log('Writing new project to database...');

		const project = mongo.db('project');

		const mongoData = {
			name: data.name,
			image,
			container,
			host,
			withProxy: data.withProxy,
		};

		const { insertedId } = await project
			.collection('projects')
			.insertOne(mongoData);

		if (data.withProxy && host) {
			console.log('Sending data to proxy...');

			proxySocket.emit('addProject', host.ip, host.port, host.domain);
		}

		console.log('Writing to cache...');

		await writeFile(
			'/cache/projects.json',
			JSON.stringify(await projectDb.collection('projects').find().toArray()),
		);

		io.emit('add', insertedId);
	}
})();

async function buildGithub(
	repo: string,
	branch: string,
	username: string,
	token: string,
) {
	const encodedToken = encodeURIComponent(token);
	const gitUrl = `https://${username}:${encodedToken}@github.com/${repo.toLowerCase()}.git#${branch}`;
	const imageName = `rd-${repo.replace('/', '-').toLowerCase()}:latest`;

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
