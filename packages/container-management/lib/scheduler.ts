class Scheduler<T> {
	private readonly tasks: T[];

	constructor(tasks: T[] = []) {
		this.tasks = tasks;
	}

	addTask(task: T) {
		this.tasks.push(task);

		if (this.tasks.length === 1) {
			this.run();
		}
	}

	private async run() {
		while (this.tasks.length > 0) {
			const task = this.tasks[0];

			await task;

			this.tasks.shift();
		}
	}
}

export default Scheduler;
