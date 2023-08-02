import axios from 'axios';

// query socket

type Container = Partial<{
	Name: string;
	Image: string;
	Env: string[];
	HostConfig: {
		NetworkMode?: string;
		Binds?: string[];
		PortBindings?: {
			[key: string]: {
				HostPort: string;
			}[];
		};
		RestartPolicy?: {
			Name: '' | 'no' | 'always' | 'unless-stopped' | 'on-failure';
			MaximumRetryCount?: number;
		};
	};
	Volumes: {
		[key: string]: {};
	};
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

async function getVolume(name: string) {
	const req = await axios({
		socketPath: '/var/run/docker.sock',
		method: 'GET',
		url: `/volumes/${name}`,
	});

	return req.data;
}

async function removeVolume(name: string) {
	await axios({
		socketPath: '/var/run/docker.sock',
		method: 'DELETE',
		url: `/volumes/${name}`,
	});
}

async function renameContainer(id: string, newName: string) {
	await axios({
		socketPath: '/var/run/docker.sock',
		method: 'POST',
		url: `/containers/${id}/rename`,
		params: {
			name: newName,
		},
	});
}

async function removeContainer(id: string) {
	await axios({
		socketPath: '/var/run/docker.sock',
		method: 'DELETE',
		url: `/containers/${id}`,
		data: {
			force: true,
		},
	});
}

async function getContainer(id: string) {
	const req = await axios({
		socketPath: '/var/run/docker.sock',
		method: 'GET',
		url: `/containers/${id}/json`,
	});

	return req.data;
}

async function stopContainer(id: string) {
	await axios({
		socketPath: '/var/run/docker.sock',
		method: 'POST',
		url: `/containers/${id}/stop`,
	});
}

export {
	createContainer,
	startContainer,
	getVolume,
	getContainer,
	removeVolume,
	renameContainer,
	removeContainer,
	stopContainer,
};
