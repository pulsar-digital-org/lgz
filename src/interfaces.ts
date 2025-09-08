/**
 * Core interfaces for the Logger System
 */

export interface ILogger {
  start(): ILogger;
  stop(message?: string): ILogger;
  isRunningFn(): boolean;
  addDetail(message: string): ILogger;
  showDetails(): ILogger;
  hideDetails(): ILogger;
  toggleDetails(): ILogger;
  getId(): string;
  expand(): ILogger;
}

export interface IExpandableLogger extends ILogger {
  addSubTask(message: string): ISubTaskBuilder;
  expand(): IExpandableLogger;
  collapse(): IExpandableLogger;
  toggle(): IExpandableLogger;
}

export interface IAnimatable {
  readonly animationType: AnimationType;
  getCurrentFrame(): string;
  getCurrentColor(): string;
  tick(): void;
  reset(): void;
}

export interface ISubTaskBuilder {
  withAnimation(type: AnimationType): ISubTaskBuilder;
  withColor(color: string): ISubTaskBuilder;
  build(): IExpandableLogger;
}

export type AnimationType =
  | "sequential_dots"
  | "spinner"
  | "pulse_color"
  | "pulse_opacity"
  | "rainbow";

export type LoggerColor = string;
export type LogStatus = "running" | "completed" | "failed";

export interface LoggerConfig {
  readonly id: string;
  readonly message: string;
  readonly animation: AnimationType;
  readonly color: LoggerColor;
  readonly level: number;
  readonly updateInterval: number;
}

export interface LogEntry {
  id: string;
  message: string;
  status: LogStatus;
  details: string[];
  showingDetails: boolean;
  animation: IAnimatable;
  level: number;
  startTime: number;
  endTime?: number;
  children: string[];
  parentId?: string;
}

export interface LogManagerConfig {
  maxActiveLogs: number;
  maxCompletedLogs: number;
  retentionTimeMs: number;
  refreshRate: number;
}
