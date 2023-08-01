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

async function createNetwork(name: string) {
	await axios({
		socketPath: '/var/run/docker.sock',
		method: 'POST',
		url: '/networks/create',
		params: {
			Name: name,
		},
	});
}

export { pullImage, createNetwork };
