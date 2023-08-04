import { Server } from 'socket.io';
import { io as SocketClient } from 'socket.io-client';
import { MongoClient } from 'mongodb';
import { buildImage } from '../lib/docker';

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
			(data: { ip: string; port: string; domain: string; name: string }) => {
				proxySocket.emit('addProject', data.ip, data.port, data.domain);

				socket.emit('add', data);
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
