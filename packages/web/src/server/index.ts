import express from 'express';
import { io } from 'socket.io-client';

const app = express();

const cmURL = `${process.env.WEB_CM_HOST}:${process.env.WEB_CM_PORT}`;
const cmSocket = io(`http://${cmURL}`, {
	transports: ['websocket'],
	reconnection: true,
});
cmSocket.connect();

app.get('*', (req, res) => {
	res.send('Coming soon!');
});

app.listen(process.env.WEB_PORT, () => {
	console.log(`Web interface listening on port ${process.env.WEB_PORT}`);
});
