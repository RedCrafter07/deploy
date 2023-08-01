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

async function createVolume(name: string) {
	await axios({
		socketPath: '/var/run/docker.sock',
		method: 'POST',
		url: '/volumes/create',
		params: {
			Name: name,
		},
	});
}

type Container = Partial<{
	Name: string;
	Image: string;
	Env: string[];
	HostConfig: {
		NetworkMode?: string;
		Binds?: string[];
	};
	Volumes: {
		[key: string]: {
			Name: string;
		};
	};
}>;

async function createContainer(container: Container) {
	const req = await axios({
		socketPath: '/var/run/docker.sock',
		method: 'POST',
		url: '/containers/create',
		data: container,
	});

	console.log(req.data);
}

export { pullImage, createNetwork, createVolume, createContainer };
