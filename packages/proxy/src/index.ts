import axios from 'axios';
import { MongoClient } from 'mongodb';
import { Server } from 'socket.io';

console.log('Welcome to the RedDeploy Proxy');

console.log('Checking environment variables...');

const user = (process.env.MONGO_USER as string) || undefined;
const pass = (process.env.MONGO_PASSWORD as string) || undefined;
const uri = (process.env.MONGO_URL as string) || undefined;

if (!(user && pass && uri)) {
	console.error('Environment variables not set!');
	process.exit(1);
}

console.log('Environment variables are set!');

console.log('Starting...');

proxyServer();

async function proxyServer() {
	const db = new MongoClient(uri!, {
		auth: {
			username: user!,
			password: pass!,
		},
		directConnection: true,
	});

	await db.connect();

	console.log('Connected to database!');

	const system = db.db('rd-system');
	const project = db.db('project');

	console.log('Getting access credentials...');

	const { npm, accessURL } = (await system.collection('config').findOne({}))!;

	const { url, email, password } = npm as { [key: string]: string };

	console.log('Getting API token...');

	const tokenReq = await axios.post(`${url}/api/tokens`, {
		email,
		password,
		scope: 'user',
	});

	let token: string = tokenReq.data.token;

	setInterval(async () => {
		try {
			const tokenReq = await axios.get(`${url}/api/tokens/refresh`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			token = tokenReq.data.token;
		} catch {
			console.error('Failed to refresh API token!');
			console.log('Getting new one...');

			const tokenReq = await axios.post(`${url}/api/tokens`, {
				email,
				password,
			});

			token = tokenReq.data.token;
		}
	}, 1 * 60 * 1000);

	console.log('API token received!');

	console.log('Checking for access url in proxy...');

	const entry = await getEntry(accessURL, token);

	if (!entry) {
		await addEntry(process.env.WEB_IP!, '80', accessURL, token);
	} else {
		await updateEntry(accessURL, process.env.WEB_IP!, '80', token);
	}

	console.log('Starting socket server...');

	const io = new Server();

	io.on('connection', (socket) => {
		socket.on('addProject', async (url: string, port: string) => {
			await addEntry(url, port, socket.id, token);
		});
	});

	io.listen(3000);

	console.log('Socket server started!');
}

async function getEntry(domain: string, token: string) {
	const { data } = await axios.get('/nginx/proxy-hosts', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return data.find((d: any) => d.domain_names.includes(domain));
}

async function addEntry(
	url: string,
	port: string,
	domain: string,
	token: string,
) {
	await axios.post(
		'/nginx/proxy-hosts',
		{
			domain_names: [domain],
			forward_host: url,
			forward_port: port,
		},
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);
}

async function updateEntry(
	domain: string,
	url: string,
	port: string,
	token: string,
) {
	const { id } = await getEntry(domain, token);

	await axios.put(
		`/nginx/proxy-hosts/${id}`,
		{
			domain_names: [domain],
			forward_host: url,
			forward_port: port,
		},
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);
}
