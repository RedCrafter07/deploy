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
		headers: {
			'Content-Type': 'application/json',
		},
		data: {
			Name: name,
		},
	});
}

async function createVolume(name: string) {
	await axios({
		socketPath: '/var/run/docker.sock',
		method: 'POST',
		url: '/volumes/create',
		headers: {
			'Content-Type': 'application/json',
		},
		data: {
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
	Cmd: string | string[];
}>;

async function createContainer(container: Container) {
	const req = await axios({
		socketPath: '/var/run/docker.sock',
		method: 'POST',
		url: '/containers/create',
		data: container,
		params: {
			name: container.Name,
		},
	});

	return req.data.Id;
}

async function startContainer(id: string) {
	await axios({
		socketPath: '/var/run/docker.sock',
		method: 'POST',
		url: `/containers/${id}/start`,
	});
}

async function getContainer(id: string) {
	try {
		const req = await axios({
			socketPath: '/var/run/docker.sock',
			method: 'GET',
			url: `/containers/${id}/json`,
		});

		return req.data;
	} catch {
		return null;
	}
}

async function getVolume(name: string) {
	try {
		const req = await axios({
			socketPath: '/var/run/docker.sock',
			method: 'GET',
			url: `/volumes/${name}`,
		});

		return req.data;
	} catch {
		return null;
	}
}

async function getNetwork(name: string) {
	try {
		const req = await axios({
			socketPath: '/var/run/docker.sock',
			method: 'GET',
			url: `/networks/${name}`,
		});

		return req.data;
	} catch {
		return null;
	}
}

export {
	pullImage,
	createNetwork,
	createVolume,
	createContainer,
	startContainer,
	getContainer,
	getVolume,
	getNetwork,
};
