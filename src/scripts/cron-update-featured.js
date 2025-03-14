#!/usr/bin/env node

/**
 * This script is designed to be run as a cron job to automatically update featured posts.
 * It can be scheduled using:
 * - Windows Task Scheduler
 * - Linux/Mac crontab
 * - Or any other task scheduling system
 * 
 * Example crontab entry (runs daily at midnight):
 * 0 0 * * * cd /path/to/your/project && node src/scripts/cron-update-featured.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..', '..');

// Log file path
const logFilePath = path.join(projectRoot, 'logs');
if (!fs.existsSync(logFilePath)) {
  fs.mkdirSync(logFilePath);
}

const logFile = path.join(logFilePath, 'featured-update.log');

try {
  console.log('Starting automated featured posts update...');
  
  // Log the start time
  const startTime = new Date();
  fs.appendFileSync(logFile, `\n[${startTime.toISOString()}] Starting featured posts update\n`);
  
  // Run the update-featured script
  const result = execSync('npm run update-featured', { 
    cwd: projectRoot,
    encoding: 'utf8'
  });
  
  // Log the result
  fs.appendFileSync(logFile, result);
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Update completed successfully\n`);
  
  console.log('Featured posts update completed successfully');
} catch (error) {
  console.error('Error updating featured posts:', error);
  
  // Log the error
  fs.appendFileSync(
    logFile, 
    `[${new Date().toISOString()}] Error updating featured posts: ${error.message}\n${error.stack}\n`
  );
  
  process.exit(1);
} 