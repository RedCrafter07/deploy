class Scheduler<T> {
	private readonly tasks: { name: string; task: T }[];

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

			await task.task;

			this.tasks.shift();
		}
	}

	getTasks() {
		return this.tasks;
	}
}

export default Scheduler;
