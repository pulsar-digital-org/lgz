/**
 * Animation System for Logger
 */

import type { AnimationType, IAnimatable, LoggerColor } from "./interfaces";

export abstract class BaseAnimation implements IAnimatable {
	protected currentFrame = 0;
	protected pulseFrame = 0;

	constructor(public readonly animationType: AnimationType) {}

	abstract getCurrentFrame(): string;
	abstract getCurrentColor(): string;

	tick(): void {
		this.currentFrame++;
		this.pulseFrame++;
	}

	reset(): void {
		this.currentFrame = 0;
		this.pulseFrame = 0;
	}
}

export class SequentialDotsAnimation extends BaseAnimation {
	private readonly dotsCount = 5;
	private readonly totalFrames = this.dotsCount * 16; // 16 frames per dot × 3 dots
	private readonly dotChar = ".";

	constructor(private readonly color: LoggerColor) {
		super("sequential_dots");
	}

	getCurrentFrame(): string {
		const cycle = this.currentFrame % this.totalFrames;
		const currentDot = Math.floor(cycle / 16); // Which dot is currently showing (0, 1, or 2)

		let result = "";

		for (let dotIndex = 0; dotIndex < this.dotsCount; dotIndex++) {
			if (dotIndex <= currentDot) {
				result += this.dotChar;
			} else {
				result += " ";
			}
		}

		return result;
	}

	getCurrentColor(): string {
		return this.color;
	}
}

export class FastPulseAnimation extends BaseAnimation {
	private static readonly PULSE_COLORS = [
		"\x1b[31m",
		"\x1b[33m",
		"\x1b[32m",
		"\x1b[36m",
		"\x1b[34m",
		"\x1b[35m",
	];
	private static readonly RAINBOW_COLORS = [
		"\x1b[91m",
		"\x1b[93m",
		"\x1b[92m",
		"\x1b[96m",
		"\x1b[94m",
		"\x1b[95m",
	];

	constructor(
		animationType: AnimationType,
		private readonly baseColor: LoggerColor,
	) {
		super(animationType);
	}

	getCurrentFrame(): string {
		switch (this.animationType) {
			case "spinner": {
				const spinnerFrames = [
					"⠋",
					"⠙",
					"⠹",
					"⠸",
					"⠼",
					"⠴",
					"⠦",
					"⠧",
					"⠇",
					"⠏",
				];
				// Slow down spinner by dividing frame count by 4
				const slowFrame = Math.floor(this.currentFrame / 4);
				return spinnerFrames[slowFrame % spinnerFrames.length];
			}
			case "pulse_color":
			case "rainbow":
				return "●";
			default:
				return "●";
		}
	}

	getCurrentColor(): string {
		switch (this.animationType) {
			case "pulse_color":
				return this.getPulseColor();
			case "rainbow":
				return this.getRainbowColor();
			default:
				return this.baseColor;
		}
	}

	private getPulseColor(): string {
		// Ultra-fast cycling: 3 frames
		const index = Math.floor(
			(this.pulseFrame / 3) % FastPulseAnimation.PULSE_COLORS.length,
		);
		return FastPulseAnimation.PULSE_COLORS[index];
	}

	private getRainbowColor(): string {
		// Ultra-fast cycling: 2 frames
		const index = Math.floor(
			(this.pulseFrame / 2) % FastPulseAnimation.RAINBOW_COLORS.length,
		);
		return FastPulseAnimation.RAINBOW_COLORS[index];
	}
}

export class AnimationFactory {
	static create(type: AnimationType, color: LoggerColor): IAnimatable {
		if (type === "sequential_dots") {
			return new SequentialDotsAnimation(color);
		}

		return new FastPulseAnimation(type, color);
	}
}
