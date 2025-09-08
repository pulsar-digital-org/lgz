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

  // Dynamic task addition while logger is running - your exact use case
  dynamicTasksDemo(): void {
    const filePath = "src/example.ts";
    
    // Your exact code pattern:
    const main = LoggerFactory.createExpandable("System deployment");
    main.start();
    
    const lgz = main
      .addSubTask(`Analyzing ${filePath}`)
      .withAnimation("spinner")
      .build();

    // Start the subtask (this was the missing piece!)
    lgz.start();

    // Simulate some analysis work
    setTimeout(() => {
      // Simulate finding functions
      const functionsResult = {
        value: [
          { name: "processData" },
          { name: "validateInput" },
          { name: "renderOutput" },
          { name: "handleError" }
        ]
      };

      const sub = lgz.addSubTask(`Found ${functionsResult.value.length} functions`).build();
      
      // Start the nested subtask (also required!)
      sub.start();
      
      functionsResult.value.forEach((func) => {
        sub.addDetail(func.name);
      });
      
      // Show the details
      sub.showDetails();
      
      lgz.expand();
      
      // Complete the tasks
      setTimeout(() => {
        main.stop("Analysis complete!");
      }, 3000);
    }, 1000);
  },

  // Demo showing completed tasks that don't disappear
  persistentTasksDemo(): void {
    // Configure to keep completed tasks visible using the user-friendly API
    LoggerFactory.keepCompletedTasks(true); // Much cleaner!

    const main = LoggerFactory.createExpandable("Long-running process");
    main.start();

    // Create multiple subtasks that complete at different times
    const task1 = main.addSubTask("Step 1: Initialize").build();
    task1.start();
    
    setTimeout(() => {
      task1.stop("Step 1 completed!");
      
      const task2 = main.addSubTask("Step 2: Process data").build();
      task2.start();
      
      setTimeout(() => {
        task2.stop("Step 2 completed!");
        
        const task3 = main.addSubTask("Step 3: Generate output").build();
        task3.start();
        
        setTimeout(() => {
          task3.stop("Step 3 completed!");
          main.stop("All steps completed! Tasks remain visible.");
          
          // Tasks will remain visible indefinitely
        }, 1500);
      }, 1500);
    }, 1500);
  },

  // Demo showing different configuration options
  configurationDemo(): void {
    console.log("=== Configuration Examples ===");
    
    // Example 1: Keep tasks for 10 seconds instead of 3
    LoggerFactory.setRetentionTime(10000).setMaxCompletedLogs(10);
    
    const task1 = LoggerFactory.createSimple("Task with 10s retention");
    task1.start();
    setTimeout(() => task1.stop("Will disappear in 10 seconds"), 1000);
    
    // Example 2: Chain configurations
    setTimeout(() => {
      LoggerFactory
        .keepCompletedTasks(true) // Keep forever
        .setMaxCompletedLogs(50); // Allow up to 50 completed tasks
      
      const task2 = LoggerFactory.createSimple("Persistent task");
      task2.start();
      setTimeout(() => task2.stop("This will stay visible forever!"), 1000);
    }, 2000);
    
    // Example 3: Reset to default behavior
    setTimeout(() => {
      LoggerFactory.keepCompletedTasks(false); // Back to 3 seconds retention
      
      const task3 = LoggerFactory.createSimple("Default behavior task");
      task3.start();
      setTimeout(() => task3.stop("Will disappear in 3 seconds"), 1000);
    }, 4000);
  },
};
