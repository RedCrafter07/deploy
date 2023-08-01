import axios from 'axios';

// query socket

async function pullImage(image: string) {
	await axios({
		socketPath: '/var/run/docker.sock',
		method: 'POST',
		url: '/images/create',
		params: {
			fromImage: image,
		},
	});
}

export { pullImage };
