import express, { Request, Response } from 'express';
import { io as SocketClient } from 'socket.io-client';
import { Server as SocketServer } from 'socket.io';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import { MongoClient, ObjectId } from 'mongodb';
import { compareSync } from 'bcrypt';
import path from 'path';

const {
	DB_HOST,
	DB_PORT,
	DB_USER,
	DB_PASS,
	COOKIE_SECRET,
	WEB_CM_HOST,
	WEB_CM_PORT,
} = process.env as Record<string, string>;

// ==== WEBSERVER SETUP ==== //

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
	transports: ['websocket'],
});

app.use(bodyParser.json());
app.use(cookieParser(COOKIE_SECRET));
app.use('/.rd-web', express.static(path.join(__dirname, '..', 'client')));

// ==== DATABASE ==== //

const mongo = new MongoClient(
	`mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}`,
	{
		auth: {
			username: DB_USER,
			password: DB_PASS,
		},
	},
);
mongo.connect();

const system = mongo.db('rd-system');
const users = system.collection('users');

// ==== CONTAINER MANAGEMENT ==== //

const cmURL = `${WEB_CM_HOST}:${WEB_CM_PORT}`;
const cmSocket = SocketClient(`http://${cmURL}`, {
	transports: ['websocket'],
	reconnection: true,
});
cmSocket.connect();

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

// ==== SOCKET IO ==== //

io.on('connect', async (socket) => {
	// check if user is logged in

	if (!socket.handshake.headers.cookie) {
		socket.emit('user', 'Not logged in');
		return socket.disconnect();
	}

	const cookie = socket.handshake.headers.cookie.split(';').find((c) => {
		return c.trim().startsWith('user=');
	});

	if (!cookie) {
		socket.emit('user', 'Not logged in');
		return socket.disconnect();
	}

	const id = cookie.split('=')[1];

	const user = await users.findOne({ _id: { $eq: new ObjectId(id) } });

	socket.emit('user', user);
});

// ==== WEBSERVER LOGIC ==== //

app.get('/', (req, res) => {
	res.send('Hello world!');
});

app.get('/login', async (req, res) => {
	if (req.cookies.user) {
		const user = await users.findOne({
			_id: { $eq: new ObjectId(req.cookies.user) },
		});

		if (user) {
			return res.redirect('/');
		}
	}

	sendClient(req, res);
});

app.post('/auth/logout', (req, res) => {
	res.clearCookie('user');
	res.sendStatus(200);
});

app.post('/auth/login', async (req, res) => {
	const { username, password } = req.body;

	const user = await users.findOne({ username });

	if (!user) {
		return res.sendStatus(404);
	}

	if (!compareSync(password, user.password)) {
		return res.sendStatus(401);
	}

	res.cookie('user', user._id.toString(), {
		maxAge: 1000 * 60 * 60 * 24 * 7,
		httpOnly: true,
	});

	res.sendStatus(200);
});

app.get('*', (req, res) => {
	res.send('Coming soon!');
});

server.listen(process.env.WEB_PORT, () => {
	console.log(`Web interface listening on port ${process.env.WEB_PORT}`);
});

function sendClient(req: Request, res: Response) {
	res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
}
