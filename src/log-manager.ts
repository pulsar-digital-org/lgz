/**
 * Log Manager - Background Table Storage & Rendering
 */

import type { LogEntry, LogManagerConfig, LogStatus } from "./interfaces";

export class LogManager {
  private static instance: LogManager;
  private logs: Map<string, LogEntry> = new Map();
  private config: LogManagerConfig;
  private renderInterval: NodeJS.Timeout | null = null;
  private isRendering = false;
  private lastLineCount = 0;

  private constructor() {
    this.config = {
      maxActiveLogs: 20,
      maxCompletedLogs: 5,
      retentionTimeMs: 3000,
      refreshRate: 16, // ~60fps for ultra-smooth animations
    };
  }

  static getInstance(): LogManager {
    if (!LogManager.instance) {
      LogManager.instance = new LogManager();
    }
    return LogManager.instance;
  }

  registerLog(entry: LogEntry): void {
    this.logs.set(entry.id, entry);
    this.startRendering();
    this.cleanupOldLogs();
  }

  updateLog(id: string, updates: Partial<LogEntry>): void {
    const entry = this.logs.get(id);
    if (entry) {
      Object.assign(entry, updates);
    }
  }

  unregisterLog(id: string, finalMessage?: string): void {
    const entry = this.logs.get(id);
    if (entry) {
      entry.status = finalMessage?.toLowerCase().includes("fail")
        ? "failed"
        : "completed";
      entry.endTime = Date.now();
      if (finalMessage) {
        entry.message = finalMessage;
      }

      // Schedule removal after retention period
      setTimeout(() => {
        this.logs.delete(id);
        if (this.logs.size === 0) {
          this.stopRendering();
        }
      }, this.config.retentionTimeMs);
    }
  }

  addDetail(id: string, detail: string): void {
    const entry = this.logs.get(id);
    if (entry) {
      entry.details.push(`${new Date().toLocaleTimeString()} - ${detail}`);
    }
  }

  toggleDetails(id: string): void {
    const entry = this.logs.get(id);
    if (entry) {
      entry.showingDetails = !entry.showingDetails;
    }
  }

  showDetails(id: string): void {
    const entry = this.logs.get(id);
    if (entry) {
      entry.showingDetails = true;
    }
  }

  hideDetails(id: string): void {
    const entry = this.logs.get(id);
    if (entry) {
      entry.showingDetails = false;
    }
  }

  private startRendering(): void {
    if (this.renderInterval) return;

    this.renderInterval = setInterval(() => {
      this.tick();
      this.render();
    }, this.config.refreshRate);
  }

  private stopRendering(): void {
    if (this.renderInterval) {
      clearInterval(this.renderInterval);
      this.renderInterval = null;
    }
    this.clearScreen();
  }

  private tick(): void {
    this.logs.forEach((entry) => {
      if (entry.status === "running") {
        entry.animation.tick();
      }
    });
  }

  private render(): void {
    if (this.isRendering || this.logs.size === 0) return;
    this.isRendering = true;

    const lines = this.buildDisplayLines();
    this.updateScreen(lines);

    this.isRendering = false;
  }

  private buildDisplayLines(): string[] {
    const lines: string[] = [];

    // Group logs by level for proper hierarchy
    const rootLogs = Array.from(this.logs.values())
      .filter((entry) => entry.level === 0)
      .sort((a, b) => a.startTime - b.startTime);

    rootLogs.forEach((entry) => {
      this.buildLogLines(entry, lines);
    });

    return lines;
  }

  private buildLogLines(entry: LogEntry, lines: string[]): void {
    // Main log line
    const indent = "  ".repeat(entry.level);
    const status = this.getStatusIcon(entry);
    const frame =
      entry.status === "running" ? entry.animation.getCurrentFrame() : "";
    const color =
      entry.status === "running"
        ? entry.animation.getCurrentColor()
        : this.getStatusColor(entry.status);
    const hasDetails = entry.details.length > 0;
    const expandIcon = hasDetails ? (entry.showingDetails ? "▼" : "▶") : "○";
    const elapsed = this.getElapsedTime(entry);

    const line = `${indent}${color}${expandIcon} [${entry.message}${frame ? " " + frame : ""}] ${status} ${elapsed}\x1b[0m`;
    lines.push(line);

    // Detail lines if expanded
    if (entry.showingDetails && entry.details.length > 0) {
      entry.details.forEach((detail) => {
        const detailIndent = "  ".repeat(entry.level + 1);
        lines.push(`${detailIndent}\x1b[90m• ${detail}\x1b[0m`);
      });
    }

    // Child logs
    entry.children.forEach((childId) => {
      const child = this.logs.get(childId);
      if (child) {
        this.buildLogLines(child, lines);
      }
    });
  }

  private getStatusIcon(entry: LogEntry): string {
    switch (entry.status) {
      case "running":
        return "";
      case "completed":
        return "\x1b[32m✓\x1b[0m";
      case "failed":
        return "\x1b[31m✗\x1b[0m";
      default:
        return "";
    }
  }

  private getStatusColor(status: LogStatus): string {
    switch (status) {
      case "completed":
        return "\x1b[32m"; // Green
      case "failed":
        return "\x1b[31m"; // Red
      default:
        return "\x1b[37m"; // White
    }
  }

  private getElapsedTime(entry: LogEntry): string {
    const endTime = entry.endTime || Date.now();
    const elapsed = Math.floor((endTime - entry.startTime) / 1000);
    return `\x1b[90m(${elapsed}s)\x1b[0m`;
  }

  private cleanupOldLogs(): void {
    const activeLogs = Array.from(this.logs.values()).filter(
      (entry) => entry.status === "running",
    );
    const completedLogs = Array.from(this.logs.values()).filter(
      (entry) => entry.status !== "running",
    );

    // Remove excess active logs (oldest first)
    if (activeLogs.length > this.config.maxActiveLogs) {
      const excess = activeLogs
        .sort((a, b) => a.startTime - b.startTime)
        .slice(0, activeLogs.length - this.config.maxActiveLogs);

      excess.forEach((entry) => this.logs.delete(entry.id));
    }

    // Remove excess completed logs (oldest first)
    if (completedLogs.length > this.config.maxCompletedLogs) {
      const excess = completedLogs
        .sort((a, b) => (a.endTime || 0) - (b.endTime || 0))
        .slice(0, completedLogs.length - this.config.maxCompletedLogs);

      excess.forEach((entry) => this.logs.delete(entry.id));
    }
  }

  private updateScreen(lines: string[]): void {
    // Clear previous lines if any exist
    if (this.lastLineCount > 0) {
      // Move cursor up and clear each line
      for (let i = 0; i < this.lastLineCount; i++) {
        process.stdout.write("\x1b[1A\x1b[2K"); // Move up one line and clear it
      }
    }

    // Write new content
    lines.forEach((line) => {
      process.stdout.write(line + "\n");
    });

    // Add instruction line
    process.stdout.write(
      "\x1b[90mPress Ctrl+C to exit | Tasks tracked in background\x1b[0m\n",
    );

    // Update line count for next clear (lines + instruction line)
    this.lastLineCount = lines.length + 1;
  }

  private clearScreen(): void {
    // Clear remaining lines if any
    if (this.lastLineCount > 0) {
      for (let i = 0; i < this.lastLineCount; i++) {
        process.stdout.write("\x1b[1A\x1b[2K");
      }
      this.lastLineCount = 0;
    }
  }
}
