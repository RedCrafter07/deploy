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

	console.log(npm);

	const { url, email, password } = npm as { [key: string]: string };

	console.log('Getting API token...');

	const tokenReq = await axios.post(`${url}/api/tokens`, {
		identity: email,
		secret: password,
		scope: 'user',
	});

	let token: string = tokenReq.data.token;

	setInterval(async () => {
		try {
			const tokenReq = await axios.get(`${url}/api/tokens`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			token = tokenReq.data.token;
		} catch {
			console.error('Failed to refresh API token!');
			console.log('Getting new one...');

			const tokenReq = await axios.post(`${url}/api/tokens`, {
				identity: email,
				secret: password,
				scope: 'user',
			});

			token = tokenReq.data.token;
		}
	}, 1 * 60 * 1000);

	console.log('API token received!');

	const npm = new NPMApi(url);

	console.log('Checking for access url in proxy...');

	const entry = await npm.getEntry(accessURL, token);

	if (!entry) {
		await npm.addEntry(process.env.WEB_IP!, '80', accessURL, token);
	} else {
		await npm.updateEntry(accessURL, process.env.WEB_IP!, '80', token);
	}

	console.log('Starting socket server...');

	const io = new Server();

	io.on('connection', (socket) => {
		socket.on(
			'addProject',
			async (ip: string, port: string, domain: string) => {
				await npm.addEntry(ip, port, domain, token);
			},
		);

		socket.on(
			'updateProject',
			async (ip: string, port: string, domain: string) => {
				await npm.updateEntry(domain, ip, port, token);
			},
		);

		socket.on('deleteProject', async (url: string) => {
			await npm.deleteEntry(url, token);
		});
	});

	io.listen(3000);

	console.log('Socket server started!');
}

class NPMApi {
	url: string;

	constructor(url: string) {
		console.log(url);
		this.url = url;
	}

	async getEntry(domain: string, token: string) {
		console.log(this.url);

		const { data } = await axios.get(`${this.url}/nginx/proxy-hosts`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return data.find((d: any) => d.domain_names.includes(domain));
	}

	async addEntry(url: string, port: string, domain: string, token: string) {
		await axios.post(
			`${this.url}/nginx/proxy-hosts`,
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

	async updateEntry(domain: string, url: string, port: string, token: string) {
		const { id } = await this.getEntry(domain, token);

		await axios.put(
			`${this.url}/nginx/proxy-hosts/${id}`,
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

	async deleteEntry(domain: string, token: string) {
		const { id } = await this.getEntry(domain, token);

		await axios.delete(`${this.url}/nginx/proxy-hosts/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	}
}
