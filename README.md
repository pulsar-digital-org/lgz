
<div align="center">
<h1>LGZ - Professional Logger System</h1>

<img src="./assets/banner.png" alt="LGZ Logger Banner" width="300">

[![GitHub stars](https://img.shields.io/github/stars/pulsar-digital-org/lgz?style=social)](https://github.com/pulsar-digital-org/lgz/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/pulsar-digital-org/lgz?style=social)](https://github.com/pulsar-digital-org/lgz/network/members)
[![GitHub issues](https://img.shields.io/github/issues/pulsar-digital-org/lgz)](https://github.com/pulsar-digital-org/lgz/issues)
[![npm version](https://img.shields.io/npm/v/lgz)](https://www.npmjs.com/package/lgz)
[![npm downloads](https://img.shields.io/npm/dm/lgz)](https://www.npmjs.com/package/lgz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

A TypeScript-based console logging system with hierarchical task management, smooth animations, and clean rendering.

## Features

- **🎯 Hierarchical Logging**: Create nested subtasks with proper indentation
- **⚡ Dynamic Task Management**: Add, start, and manage tasks while the logger is running
- **🎨 Smooth Animations**: Multiple animation types (spinner, dots, pulse, rainbow)
- **📊 Smart Retention**: Configure how long completed tasks remain visible
- **🔗 Chainable API**: Fluent interface for easy configuration
- **🎛️ Expandable Tasks**: Show/hide task details and subtasks
- **⚙️ TypeScript Native**: Full type safety and IntelliSense support

## Installation

```bash
npm install lgz
# or
pnpm install lgz
# or
yarn add lgz
```

## Quick Start

```typescript
import { LoggerFactory } from 'lgz';

// Simple logger
const logger = LoggerFactory.createSimple('Processing files', 'spinner');
logger.start();
logger.addDetail('Found 120 files');
logger.stop('Processing complete!');

// Expandable logger with subtasks
const main = LoggerFactory.createExpandable('System deployment');
main.start();

const buildTask = main.addSubTask('Building application')
  .withAnimation('spinner')
  .build();
buildTask.start();
buildTask.stop('Build complete!');

main.expand(); // Show all subtasks
main.stop('Deployment successful!');
```

## Core API

### LoggerFactory

#### Simple Loggers
```typescript
// Basic logger
LoggerFactory.createSimple(message, animation);

// Predefined pulsing effects
LoggerFactory.createPulsing(message, 'color' | 'rainbow');
```

#### Expandable Loggers
```typescript
// Create expandable logger for hierarchical tasks
LoggerFactory.createExpandable(message);
```

#### Configuration
```typescript
// Keep completed tasks visible
LoggerFactory.keepCompletedTasks(true);

// Set custom retention time
LoggerFactory.setRetentionTime(10000); // 10 seconds

// Set max completed tasks
LoggerFactory.setMaxCompletedLogs(20);

// Chain configurations
LoggerFactory
  .keepCompletedTasks(true)
  .setMaxCompletedLogs(50)
  .createExpandable('My Process');
```

### Logger Methods

```typescript
// Lifecycle
logger.start();
logger.stop('Final message');
logger.isRunningFn();

// Details management
logger.addDetail('Step completed');
logger.showDetails();
logger.hideDetails();
logger.toggleDetails();

// Expandable-specific
expandableLogger.addSubTask('Subtask name')
  .withAnimation('spinner')
  .withColor('\x1b[33m')
  .build();

expandableLogger.expand();    // Show all subtasks
expandableLogger.collapse();  // Hide all subtasks
expandableLogger.toggle();    // Toggle visibility
```

## Animation Types

- `sequential_dots` - Animated dots (. → .. → ...)
- `spinner` - Rotating spinner (⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏)
- `pulse_color` - Color pulsing effect
- `pulse_opacity` - Opacity pulsing effect
- `rainbow` - Rainbow color cycling

## Examples

### Dynamic Task Addition
```typescript
import { LoggerFactory } from 'lgz';

const main = LoggerFactory.createExpandable('Code Analysis');
main.start();

// Add tasks while running
const analyzeTask = main
  .addSubTask('Analyzing functions')
  .withAnimation('spinner')
  .build();
analyzeTask.start();

// Add nested subtasks
const detailTask = analyzeTask
  .addSubTask('Found 15 functions')
  .build();
detailTask.start();

// Add details dynamically
['parseConfig', 'validateData', 'processResults'].forEach(fn => {
  detailTask.addDetail(`Function: ${fn}`);
});

detailTask.showDetails();
analyzeTask.expand();
main.stop('Analysis complete!');
```

### Multiple Concurrent Tasks
```typescript
LoggerFactory.keepCompletedTasks(true); // Keep all tasks visible

const tasks = [
  LoggerFactory.createSimple('Database migration', 'sequential_dots'),
  LoggerFactory.createSimple('API deployment', 'spinner'),
  LoggerFactory.createSimple('Cache warming', 'pulse_opacity'),
];

tasks.forEach((task, index) => {
  setTimeout(() => {
    task.start();
    setTimeout(() => task.stop(`Task ${index + 1} completed!`), 2000);
  }, index * 500);
});
```

### Configuration Examples
```typescript
// Keep tasks visible for 30 seconds
LoggerFactory.setRetentionTime(30000);

// Keep tasks forever
LoggerFactory.keepCompletedTasks(true);

// Reset to default (3 seconds)
LoggerFactory.keepCompletedTasks(false);

// Advanced configuration
LoggerFactory.configure({
  retentionTimeMs: 15000,
  maxCompletedLogs: 25,
  maxActiveLogs: 10,
  refreshRate: 32, // ~30fps
});
```

## Output Examples

### Hierarchical Structure
```
○ [System deployment ...]  (2s)
  ○ [Building application] ✓ (1s)
  ○ [Running tests ⠋]  (0s)
    ▼ [Unit tests] ✓ (0s)
      • 5:23:45 PM - test/utils.spec.js
      • 5:23:45 PM - test/logger.spec.js
  ○ [Deploying servers ...]  (0s)
```

### Status Indicators
- `○` - Task marker
- `▼` - Expanded (showing details)
- `▶` - Collapsed (details hidden)
- `✓` - Completed successfully
- `✗` - Failed
- `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` - Spinner animations
- `...` - Sequential dots animation

## TypeScript Support

Full TypeScript definitions included:

```typescript
interface ILogger {
  start(): ILogger;
  stop(message?: string): ILogger;
  addDetail(message: string): ILogger;
  showDetails(): ILogger;
  // ... more methods
}

interface IExpandableLogger extends ILogger {
  addSubTask(message: string): ISubTaskBuilder;
  expand(): IExpandableLogger;
  collapse(): IExpandableLogger;
}

type AnimationType = 
  | 'sequential_dots' 
  | 'spinner' 
  | 'pulse_color' 
  | 'pulse_opacity' 
  | 'rainbow';
```

## Development

```bash
# Install dependencies
pnpm install

# Development mode
npm run dev

# Build for production
npm run build

# Run examples
npx tsx examples/demo.ts
```

## License

MIT

---

**Perfect for**: CLI tools, build systems, deployment scripts, data processing pipelines, and any application requiring visual progress tracking with hierarchical task management.