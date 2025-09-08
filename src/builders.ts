/**
 * Builder Pattern Implementations
 */

import type { LoggerConfig, AnimationType, LoggerColor } from "./interfaces";
import { AnimationFactory } from "./animations";
import { SimpleLogger, FuturisticLogger } from "./loggers";

export class LoggerBuilder {
  private message = "Loading";
  private animation: AnimationType = "sequential_dots";
  private color: LoggerColor = "\x1b[36m";
  private level = 0;
  private updateInterval = 16; // Ultra-fast 60fps

  withMessage(message: string): LoggerBuilder {
    this.message = message;
    return this;
  }

  withAnimation(animation: AnimationType): LoggerBuilder {
    this.animation = animation;
    return this;
  }

  withColor(color: LoggerColor): LoggerBuilder {
    this.color = color;
    return this;
  }

  withLevel(level: number): LoggerBuilder {
    this.level = level;
    return this;
  }

  withUpdateInterval(interval: number): LoggerBuilder {
    this.updateInterval = interval;
    return this;
  }

  build(): FuturisticLogger {
    const config: LoggerConfig = {
      id: `logger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: this.message,
      animation: this.animation,
      color: this.color,
      level: this.level,
      updateInterval: this.updateInterval,
    };

    const animation = AnimationFactory.create(this.animation, this.color);
    return new FuturisticLogger(config, animation);
  }

  buildSimple(): SimpleLogger {
    const config: LoggerConfig = {
      id: `simple_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: this.message,
      animation: this.animation,
      color: this.color,
      level: this.level,
      updateInterval: this.updateInterval,
    };

    const animation = AnimationFactory.create(this.animation, this.color);
    return new SimpleLogger(config, animation);
  }
}
