import axios from 'axios';

// query socket

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

async function getVolume(name: string) {}

export { createContainer, startContainer };
