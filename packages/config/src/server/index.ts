import express from 'express';
import path from 'path';

const app = express();

app.use('/.rd', express.static(path.join(__dirname, '..', 'client')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', '..', 'src', 'client', 'index.html'));
});
app.get('*', (req, res) => {
	res.redirect('/');
});

app.listen(9272, () => {
	console.log('Config interface running on port 9272');
});
