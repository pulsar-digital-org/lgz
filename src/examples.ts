/**
 * Usage Examples and Demos
 */

import { LoggerFactory } from "./factory";

export const Examples = {
  // Sequential dots animation demo
  sequentialDotsDemo(): void {
    const logger = LoggerFactory.createSimple(
      "Processing files",
      "sequential_dots",
    );
    logger.start();

    setTimeout(() => logger.addDetail("Reading config"), 1000);
    setTimeout(() => logger.addDetail("Validating data"), 2000);
    setTimeout(() => logger.showDetails(), 2500);
    setTimeout(() => logger.addDetail("Writing output"), 3500);

    setTimeout(() => {
      logger.stop("Processing complete!");
    }, 5000);
  },

  // Multiple concurrent tasks with clean list
  multiTaskDemo(): void {
    const tasks = [
      LoggerFactory.createSimple("Database migration", "sequential_dots"),
      LoggerFactory.createSimple("API deployment", "spinner"),
      LoggerFactory.createSimple("Cache warming", "pulse_opacity"),
      LoggerFactory.createSimple("Index rebuilding", "sequential_dots"),
    ];

    // Start all tasks with staggered timing
    tasks.forEach((task, index) => {
      setTimeout(() => {
        task.start();

        // Add details over time
        setTimeout(() => task.addDetail("Initializing"), 500);
        setTimeout(() => task.addDetail("Processing"), 1500);
        setTimeout(() => task.showDetails(), 2000);
        setTimeout(() => task.addDetail("Finalizing"), 3000);

        // Complete at different times
        setTimeout(
          () => {
            task.stop(`Task ${index + 1} completed!`);
          },
          4000 + index * 1000,
        );
      }, index * 300);
    });
  },

  // Hierarchical example with sequential dots
  hierarchicalDemo(): void {
    const main = LoggerFactory.createExpandable("System deployment");

    const build = main
      .addSubTask("Building application")
      .withAnimation("sequential_dots")
      .build();
    const test = main
      .addSubTask("Running tests")
      .withAnimation("spinner")
      .build();
    const deploy = main
      .addSubTask("Deploying servers")
      .withAnimation("pulse_opacity")
      .build();

    main.start().expand();

    // Add details that don't interfere with other tasks
    main.addDetail("Starting pipeline");
    main.addDetail("Checking prerequisites");

    setTimeout(() => {
      main.showDetails(); // Only expands main task
      (build as any).addDetail("Compiling TypeScript");
      (build as any).showDetails(); // Only expands build task
    }, 2000);

    setTimeout(() => {
      main.stop("Deployment successful!");
    }, 8000);
  },
};
