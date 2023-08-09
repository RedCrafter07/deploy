class Scheduler<T> {
	private tasks: { name: string; task: T }[];
	protected currentTask: string;

	constructor() {
		this.tasks = [];
	}

	addTask(name: string, task: T) {
		this.tasks.push({ name, task });

		if (this.tasks.length === 1) {
			this.run();
		}
	}

	private async run() {
		while (this.tasks.length > 0) {
			const task = this.tasks[0];

			this.currentTask = task.name;
			await task.task;

			this.tasks.shift();
		}
	}

	getCurrentTask() {
		return this.currentTask;
	}

	getTasks() {
		return this.tasks.map((t) => ({
			...t,
			current: t.name === this.currentTask,
		}));
	}
}

export default Scheduler;
