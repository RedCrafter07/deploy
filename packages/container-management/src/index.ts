import { Server } from 'socket.io';
import { io as SocketClient } from 'socket.io-client';
import { MongoClient } from 'mongodb';
import {
	buildImage,
	createContainer,
	getContainer,
	startContainer,
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

(async () => {
	await mongo.connect();

	console.log('Connected to database!');

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

				const container = await createContainer({
					Image: image,
					Name: `${prefix}-${data.name.replace(' ', '_').toLowerCase()}`,
				});

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

				await project.collection('projects').insertOne(mongoData);

				console.log('Sending data to proxy...');

				proxySocket.emit('addProject', host.ip, host.port, host.domain);

				socket.emit(
					'add',
					await project.collection('projects').findOne(mongoData),
				);
			},
		);
	});

	io.listen(parseInt(process.env.CM_PORT!));
	console.log('CM socket listening');
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
