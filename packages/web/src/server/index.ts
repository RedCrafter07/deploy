import express from 'express';
import { io } from 'socket.io-client';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const cmURL = `${process.env.WEB_CM_HOST}:${process.env.WEB_CM_PORT}`;
const cmSocket = io(`http://${cmURL}`, {
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

app.post('/api/cm', (req, res) => {
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
});

app.get('*', (req, res) => {
	res.send('Coming soon!');
});

app.listen(process.env.WEB_PORT, () => {
	console.log(`Web interface listening on port ${process.env.WEB_PORT}`);
});
