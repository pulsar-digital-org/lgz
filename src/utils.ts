/**
 * Utility Functions and Task Groups
 */

import { LoggerFactory } from "./factory";
import type { AnimationType, IExpandableLogger, ILogger } from "./interfaces";

export class LoaderUtils {
	static async withLoading<T>(
		promise: Promise<T>,
		message: string = "Loading",
		animation: AnimationType = "sequential_dots",
	): Promise<T> {
		const logger = LoggerFactory.createSimple(message, animation);
		logger.start();

		try {
			const result = await promise;
			logger.stop("Complete!");
			return result;
		} catch (error) {
			logger.stop("Failed!");
			throw error;
		}
	}

	static createTaskGroup(mainMessage: string): TaskGroup {
		return new TaskGroup(mainMessage);
	}

	static createDetailedLogger(
		message: string = "Loading",
		animation: AnimationType = "sequential_dots",
	): ILogger {
		return LoggerFactory.createSimple(message, animation);
	}
}

export class TaskGroup {
	private readonly logger: IExpandableLogger;
	private readonly tasks: Map<string, IExpandableLogger> = new Map();

	constructor(message: string) {
		this.logger = LoggerFactory.createExpandable(message);
	}

	addTask(
		key: string,
		message: string,
		animation: AnimationType = "sequential_dots",
	): TaskGroup {
		const task = this.logger
			.addSubTask(message)
			.withAnimation(animation)
			.build();

		this.tasks.set(key, task);
		return this;
	}

	start(): TaskGroup {
		this.logger.start().expand();
		return this;
	}

	completeTask(key: string, message?: string): TaskGroup {
		const task = this.tasks.get(key);
		if (task) {
			task.stop(message || "Done");
		}
		return this;
	}

	stop(message?: string): TaskGroup {
		this.logger.stop(message);
		return this;
	}
}
