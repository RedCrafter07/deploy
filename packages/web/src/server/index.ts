import express from 'express';
import { io as SocketClient } from 'socket.io-client';
import { Server as SocketServer } from 'socket.io';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
	transports: ['websocket'],
});

app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

const cmURL = `${process.env.WEB_CM_HOST}:${process.env.WEB_CM_PORT}`;
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

/* app.post('/api/cm', (req, res) => {
	const data = req.body as ProjectData;

	cmSocket.emit('add', data);

	res.sendStatus(200);
});

app.get('/api/cm', (req, res) => {
	cmSocket.emit('get all');

	cmSocket.once('get all', (data: any) => {
		res.json(data);
	});
});

app.delete('/api/cm/:id', (req, res) => {
	const id = req.params.id;

	cmSocket.emit('remove', id);

	res.sendStatus(200);
}); */

app.get('/', (req, res) => {});
app.get('*', (req, res) => {
	res.send('Coming soon!');
});

server.listen(process.env.WEB_PORT, () => {
	console.log(`Web interface listening on port ${process.env.WEB_PORT}`);
});
