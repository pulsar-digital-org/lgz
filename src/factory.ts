/**
 * Factory Pattern for Logger Creation
 */

import type { ILogger, IExpandableLogger, AnimationType } from "./interfaces";
import { LoggerBuilder } from "./builders.js";

export class LoggerFactory {
  static create(message: string = "Loading"): LoggerBuilder {
    return new LoggerBuilder().withMessage(message);
  }

  static createSimple(
    message: string = "Loading",
    animation: AnimationType = "sequential_dots",
  ): ILogger {
    return this.create(message).withAnimation(animation).buildSimple();
  }

  static createPulsing(
    message: string = "Loading",
    pulseType: "color" | "rainbow" = "color",
  ): ILogger {
    const animationMap = {
      color: "pulse_color" as AnimationType,
      rainbow: "rainbow" as AnimationType,
    };

    return this.create(message)
      .withAnimation(animationMap[pulseType])
      .buildSimple();
  }

  static createExpandable(message: string = "Loading"): IExpandableLogger {
    return this.create(message)
      .withAnimation("sequential_dots")
      .withColor("\x1b[35m")
      .build();
  }
}
