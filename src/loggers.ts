/**
 * Logger Implementations
 */

import { AnimationFactory } from "./animations";
import type {
	AnimationType,
	IAnimatable,
	IExpandableLogger,
	ILogger,
	ISubTaskBuilder,
	LogEntry,
	LoggerColor,
	LoggerConfig,
} from "./interfaces";
import { LogManager } from "./log-manager";

export class SimpleLogger implements ILogger {
	private readonly config: LoggerConfig;
	private readonly animation: IAnimatable;
	private isRunning = false;
	private logManager: LogManager;

	constructor(config: LoggerConfig, animation: IAnimatable) {
		this.config = config;
		this.animation = animation;
		this.logManager = LogManager.getInstance();
	}

	start(): ILogger {
		if (this.isRunning) return this;

		this.isRunning = true;
		this.animation.reset();

		const entry: LogEntry = {
			id: this.config.id,
			message: this.config.message,
			status: "running",
			details: [],
			showingDetails: false,
			animation: this.animation,
			level: this.config.level,
			startTime: Date.now(),
			children: [],
		};

		this.logManager.registerLog(entry);
		return this;
	}

	stop(finalMessage?: string): ILogger {
		if (!this.isRunning) return this;

		this.isRunning = false;
		this.logManager.unregisterLog(this.config.id, finalMessage);
		return this;
	}

	addDetail(message: string): ILogger {
		this.logManager.addDetail(this.config.id, message);
		return this;
	}

	showDetails(): ILogger {
		this.logManager.showDetails(this.config.id);
		return this;
	}

	hideDetails(): ILogger {
		this.logManager.hideDetails(this.config.id);
		return this;
	}

	toggleDetails(): ILogger {
		this.logManager.toggleDetails(this.config.id);
		return this;
	}

	isRunningFn(): boolean {
		return this.isRunning;
	}

	getId(): string {
		return this.config.id;
	}

	expand(): ILogger {
		return this;
	}
}

export class FuturisticLogger implements IExpandableLogger {
	private readonly config: LoggerConfig;
	private readonly animation: IAnimatable;
	private readonly children: Map<string, FuturisticLogger> = new Map();
	private isRunning = false;
	private isExpanded = false;
	private childCounter = 0;
	private logManager: LogManager;

	constructor(config: LoggerConfig, animation: IAnimatable) {
		this.config = config;
		this.animation = animation;
		this.logManager = LogManager.getInstance();
	}

	start(): ILogger {
		if (this.isRunning) return this;

		this.isRunning = true;
		this.animation.reset();

		const entry: LogEntry = {
			id: this.config.id,
			message: this.config.message,
			status: "running",
			details: [],
			showingDetails: false,
			animation: this.animation,
			level: this.config.level,
			startTime: Date.now(),
			children: Array.from(this.children.keys()),
			parentId: this.config.level > 0 ? this.getParentId() : undefined,
		};

		this.logManager.registerLog(entry);
		return this;
	}

	stop(finalMessage?: string): ILogger {
		if (!this.isRunning) return this;

		this.isRunning = false;

		// Stop all children
		this.children.forEach((child) => child.stop());

		this.logManager.unregisterLog(this.config.id, finalMessage);
		return this;
	}

	addDetail(message: string): ILogger {
		this.logManager.addDetail(this.config.id, message);
		return this;
	}

	showDetails(): ILogger {
		this.logManager.showDetails(this.config.id);
		return this;
	}

	hideDetails(): ILogger {
		this.logManager.hideDetails(this.config.id);
		return this;
	}

	toggleDetails(): ILogger {
		this.logManager.toggleDetails(this.config.id);
		return this;
	}

	addSubTask(message: string): ISubTaskBuilder {
		return new SubTaskBuilder(this, message);
	}

	expand(): IExpandableLogger {
		this.isExpanded = true;
		this.children.forEach((child) => {
			if (!child.isRunningFn()) {
				child.start();
			}
		});

		// Update children list in LogManager
		if (this.isRunning) {
			this.logManager.updateLog(this.config.id, {
				children: Array.from(this.children.keys()),
			});
		}

		return this;
	}

	collapse(): IExpandableLogger {
		this.isExpanded = false;
		this.children.forEach((child) => child.stop());
		return this;
	}

	toggle(): IExpandableLogger {
		return this.isExpanded ? this.collapse() : this.expand();
	}

	isRunningFn(): boolean {
		return this.isRunning;
	}

	getId(): string {
		return this.config.id;
	}

	createSubTask(
		message: string,
		animation: AnimationType = "sequential_dots",
		color: LoggerColor = "\x1b[33m",
	): FuturisticLogger {
		const childId = `${this.config.id}_child_${this.childCounter++}`;

		const childConfig: LoggerConfig = {
			id: childId,
			message,
			animation,
			color,
			level: this.config.level + 1,
			updateInterval: this.config.updateInterval,
			parentId: this.config.id,
		};

		const childAnimation = AnimationFactory.create(animation, color);
		const child = new FuturisticLogger(childConfig, childAnimation);

		this.children.set(childId, child);

		// Update parent's children list in LogManager if parent is already registered
		if (this.isRunning) {
			this.logManager.updateLog(this.config.id, {
				children: Array.from(this.children.keys()),
			});
		}

		return child;
	}

	private getParentId(): string | undefined {
		return this.config.parentId;
	}
}

export class SubTaskBuilder implements ISubTaskBuilder {
	private animation: AnimationType = "sequential_dots";
	private color: LoggerColor = "\x1b[33m";

	constructor(
		private readonly parent: FuturisticLogger,
		private readonly message: string,
	) {}

	withAnimation(type: AnimationType): ISubTaskBuilder {
		this.animation = type;
		return this;
	}

	withColor(color: string): ISubTaskBuilder {
		this.color = color;
		return this;
	}

	build(): IExpandableLogger {
		const child = (this.parent as any).createSubTask(
			this.message,
			this.animation,
			this.color,
		);
		return child;
	}
}
