/**
 * Factory Pattern for Logger Creation
 */

import { LoggerBuilder } from "./builders.js";
import type {
	AnimationType,
	IExpandableLogger,
	ILogger,
	LogManagerConfig,
} from "./interfaces";
import { LogManager } from "./log-manager.js";

export class LoggerFactory {
	// Configure logger behavior globally
	static configure(options: Partial<LogManagerConfig>): typeof LoggerFactory {
		LogManager.getInstance().configure(options);
		return LoggerFactory;
	}

	// Convenience methods for common configurations
	static keepCompletedTasks(keepForever: boolean = true): typeof LoggerFactory {
		return LoggerFactory.configure({
			retentionTimeMs: keepForever ? 0 : 3000,
			maxCompletedLogs: keepForever ? 100 : 5,
		});
	}

	static setRetentionTime(milliseconds: number): typeof LoggerFactory {
		return LoggerFactory.configure({ retentionTimeMs: milliseconds });
	}

	static setMaxCompletedLogs(maxLogs: number): typeof LoggerFactory {
		return LoggerFactory.configure({ maxCompletedLogs: maxLogs });
	}

	static create(message: string = "Loading"): LoggerBuilder {
		return new LoggerBuilder().withMessage(message);
	}

	static createSimple(
		message: string = "Loading",
		animation: AnimationType = "sequential_dots",
	): ILogger {
		return LoggerFactory.create(message).withAnimation(animation).buildSimple();
	}

	static createPulsing(
		message: string = "Loading",
		pulseType: "color" | "rainbow" = "color",
	): ILogger {
		const animationMap = {
			color: "pulse_color" as AnimationType,
			rainbow: "rainbow" as AnimationType,
		};

		return LoggerFactory.create(message)
			.withAnimation(animationMap[pulseType])
			.buildSimple();
	}

	static createExpandable(message: string = "Loading"): IExpandableLogger {
		return LoggerFactory.create(message)
			.withAnimation("sequential_dots")
			.withColor("\x1b[35m")
			.build();
	}
}
