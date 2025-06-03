#!/usr/bin/env node

/**
 * This is a custom build script for Vercel that works around the
 * Rollup dependency issues with platform-specific binaries.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Display Node.js version and environment for debugging
console.log(`Using Node.js ${process.version}`);
console.log(`Platform: ${process.platform}, Architecture: ${process.arch}`);
console.log(`Current directory: ${process.cwd()}`);

try {
  // Remove the problematic Rollup dependencies if they exist
  console.log('Checking for problematic Rollup dependencies...');
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const rollupPath = path.join(nodeModulesPath, 'rollup');
  
  if (fs.existsSync(rollupPath)) {
    console.log('Removing existing Rollup installation...');
    try {
      // Removing the native.js file that tries to load platform-specific modules
      const nativePath = path.join(rollupPath, 'dist', 'native.js');
      if (fs.existsSync(nativePath)) {
        console.log(`Modifying ${nativePath} to skip platform-specific modules...`);
        // Create a backup of the original file
        fs.copyFileSync(nativePath, `${nativePath}.bak`);
        
        // Replace the content with a simplified version that doesn't try to load platform-specific modules
        const content = `
// Modified to avoid platform-specific dependencies
export const getDefaultsFromPlugins = () => ({ });
export const wrapHelpers = () => ({ });
`;
        fs.writeFileSync(nativePath, content);
        console.log('Successfully modified native.js');
      }
    } catch (err) {
      console.warn('Failed to modify Rollup files, continuing anyway:', err.message);
    }
  }

  // Install a specific version of rollup globally to avoid the platform-specific dependencies
  console.log('Installing Rollup globally...');
  execSync('npm install rollup@4.12.0 -g', { stdio: 'inherit' });
  
  // Make sure vite and SvelteKit are properly installed
  console.log('Installing build dependencies...');
  execSync('npm install @sveltejs/kit vite --no-save', { stdio: 'inherit' });
  
  // Create an .npmrc file in the current directory to disable optional dependencies
  console.log('Ensuring .npmrc configuration...');
  const npmrcContent = `
optional=false
omit=optional
legacy-peer-deps=true
ignore-scripts=false
`;
  fs.writeFileSync('.npmrc', npmrcContent);
  
  // Run the build process using the globally installed Rollup
  console.log('Building the application...');
  try {
    execSync('npx vite build', { stdio: 'inherit' });
  } catch (buildError) {
    console.log('First build attempt failed, trying alternate approach...');
    
    // If the first build fails, try using the SvelteKit CLI directly
    try {
      execSync('npx svelte-kit build', { stdio: 'inherit' });
    } catch (skBuildError) {
      console.error('SvelteKit build also failed:', skBuildError.message);
      throw skBuildError;
    }
  }
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
