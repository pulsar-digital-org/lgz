/**
 * Professional Logger System with Background Table Storage & Clean Rendering
 *
 * Features:
 * - Background table storage for task tracking (no visual table)
 * - Clean list-style rendering without borders/headers
 * - Sequential dot opacity animation (. -> .. -> ... with fade-in effect)
 * - Ultra-fast refresh rate for smooth animations
 * - Smart log retention and status tracking
 * - Independent task expansion without affecting others
 *
 * Usage:
 * ```typescript
 * const logger = LoggerFactory.createSimple('Processing', 'sequential_dots');
 * logger.start();
 * logger.addDetail('Step 1 complete');
 * logger.showDetails(); // Expand this task only
 * logger.stop('Finished!');
 * ```
 */

import { Examples } from "./examples";

export { LoggerFactory } from "./factory";
export { LoggerBuilder } from "./builders";
export { Examples } from "./examples";
export type { ILogger, IExpandableLogger, AnimationType } from "./interfaces";

Examples.multiTaskDemo();