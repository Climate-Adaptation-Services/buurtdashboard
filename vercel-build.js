#!/usr/bin/env node

/**
 * This is a custom build script for Vercel that works around the
 * Rollup dependency issues with platform-specific binaries.
 */

import { execSync } from 'child_process';
import fs from 'fs';

// Display Node.js version for debugging
console.log(`Using Node.js ${process.version}`);

try {
  // Install a specific version of rollup globally to avoid the platform-specific dependencies
  console.log('Installing Rollup globally...');
  execSync('npm install rollup@4.12.0 -g', { stdio: 'inherit' });
  
  // Run the normal build process
  console.log('Building the application...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
