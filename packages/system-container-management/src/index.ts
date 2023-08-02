// import { Server } from 'socket.io';

import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import mongo from 'mongodb';
import {
	createContainer,
	getVolume,
	removeContainer,
	removeVolume,
	renameContainer,
	startContainer,
} from '../lib/docker.js';

const client = new mongo.MongoClient(
	`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`,
	{
		auth: {
			username: process.env.MONGO_USER,
			password: process.env.MONGO_PASS,
		},
	},
);

// const io = new Server({
// 	transports: ['websocket'],
// });

// io.on('connect', (socket) => {
// 	console.log('A socket connected!');
// });

// io.listen(8080);
// console.log('SCM socket listening');

console.log('SCM started.');

console.log('Checking config...');
if (await existsSync('/data/config.json')) {
	console.log('Config detected!');

	console.log('Reading config...');

	interface Config {
		domain: string;
		username: string;
		password: string;
		proxy: 'NGINX Proxy Manager' | 'NGINX';
		prefix: string;
	}

	const config = JSON.parse(
		await readFile('/data/config.json', 'utf-8'),
	) as Config;
	const containers = JSON.parse(
		await readFile('/data/containers.json', 'utf-8'),
	);

	console.log('Connecting to database...');

	await client.connect();

	console.log('Connected to database!');

	console.log('Initializing databases...');

	const system = client.db('system');
	const project = client.db('project');

	console.log('Initialized databases!');

	console.log('Writing system containers...');

	await system.collection('containers').insertOne(containers);

	console.log('Writing users...');

	await system.collection('users').insertOne({
		username: config.username,
		password: config.password,
		admin: true,
	});

	console.log('Writing config...');

	await system.collection('config').insertOne({
		accessURL: config.domain,
		proxy: config.proxy,
		prefix: config.prefix,
	});

	console.log("Rename SCM container to 'reddeploy-scm-old'...");

	await renameContainer('reddeploy-scm', 'reddeploy-scm-old');

	console.log('Create new SCM container without volume...');

	const id = await createContainer({
		Image: 'ghcr.io/redcrafter07/deploy/scm:prod',
		Name: 'reddeploy-scm',
		HostConfig: {
			NetworkMode: 'reddeploy',
			Binds: ['/var/run/docker.sock:/var/run/docker.sock'],
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

	const oldContainers = await system.collection('containers').findOne();
	await system.collection('containers').deleteOne({});

	await project
		.collection('containers')
		.insertOne({ ...oldContainers, scm: id });

	await startContainer(id);

	console.log('New container started!');

	console.log('Removing & exiting...');

	client.close();

	await removeContainer('reddeploy-scm-old');
} else {
	console.log('Config not detected! Checking for volume...');

	if (await getVolume('reddeploy_config')) {
		console.log('Volume found! Removing...');

		console.log('Waiting for old container to stop...');

		await timeout(5000);

		console.log('Continuing...');

		await removeVolume('reddeploy_config');
		console.log('Volume removed!');
	} else console.log('Volume not detected! Skipping postinstall...');
}

async function timeout(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}