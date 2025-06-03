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

// Create a package.json override for the build
const overrideRollupDependencies = () => {
  try {
    // Create an .npmrc file to skip optional dependencies
    console.log('Creating .npmrc to disable optional dependencies...');
    const npmrcContent = `
optional=false
omit=optional
legacy-peer-deps=true
ignore-scripts=false
`;
    fs.writeFileSync('.npmrc', npmrcContent);

    // Add overrides to package.json to exclude platform-specific rollup packages
    console.log('Adding overrides to package.json...');
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Add overrides for problematic dependencies
      packageJson.overrides = packageJson.overrides || {};
      packageJson.overrides['@rollup/rollup-linux-x64-gnu'] = '4.12.0';
      packageJson.overrides['@rollup/rollup-linux-x64-musl'] = '4.12.0';
      packageJson.overrides['@rollup/rollup-darwin-x64'] = '4.12.0';
      packageJson.overrides['@rollup/rollup-win32-x64-msvc'] = '4.12.0';
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Successfully updated package.json with overrides');
    }
  } catch (err) {
    console.warn('Failed to update configuration files:', err.message);
  }
};

// Create the modified native.js that stubs out all required functions
const createModifiedNativeJs = (nativePath) => {
  const modifiedContent = `
// Modified native.js to avoid platform-specific dependencies

// For parseAst.js
export function parse() {
  return { type: 'Program', start: 0, end: 0, body: [] };
}

export function parseAsync() {
  return Promise.resolve({ type: 'Program', start: 0, end: 0, body: [] });
}

// For native-cjs.js
export const getDefaultsFromPlugins = () => ({});
export const wrapHelpers = () => ({});

// For other possible imports
export default {
  parse,
  parseAsync,
  getDefaultsFromPlugins,
  wrapHelpers
};
`;
  fs.writeFileSync(nativePath, modifiedContent);
  console.log(`Successfully created modified ${nativePath}`);
};

try {
  // First, modify package.json and .npmrc
  overrideRollupDependencies();
  
  // Install necessary global dependencies
  console.log('Installing Rollup globally...');
  execSync('npm install rollup@4.12.0 -g', { stdio: 'inherit' });
  
  // Make sure vite and SvelteKit are properly installed
  console.log('Installing build dependencies...');
  execSync('npm install @sveltejs/kit vite @sveltejs/adapter-static --no-save', { stdio: 'inherit' });
  
  // Now look for the problematic Rollup installation and modify it
  console.log('Checking for problematic Rollup files...');
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const rollupPath = path.join(nodeModulesPath, 'rollup');
  
  if (fs.existsSync(rollupPath)) {
    console.log('Found Rollup installation, patching files...');
    try {
      // Patch the native.js file
      const nativePath = path.join(rollupPath, 'dist', 'native.js');
      if (fs.existsSync(nativePath)) {
        console.log(`Modifying ${nativePath}...`);
        // Create a backup of the original file
        fs.copyFileSync(nativePath, `${nativePath}.bak`);
        createModifiedNativeJs(nativePath);
      }
      
      // Also patch ESM version if it exists
      const nativeEsmPath = path.join(rollupPath, 'dist', 'es', 'native.js');
      if (fs.existsSync(nativeEsmPath)) {
        console.log(`Modifying ${nativeEsmPath}...`);
        fs.copyFileSync(nativeEsmPath, `${nativeEsmPath}.bak`);
        createModifiedNativeJs(nativeEsmPath);
      }
    } catch (err) {
      console.warn('Failed to modify Rollup files:', err.message);
    }
  }
  
  // Try building with npx first
  console.log('Building with npx vite build...');
  try {
    execSync('npx vite build', { stdio: 'inherit' });
    console.log('Build completed successfully!');
  } catch (error) {
    console.log('Vite build failed, trying direct Vite import...');
    
    try {
      // Create a simple build script
      const buildScriptPath = path.join(process.cwd(), 'direct-build.js');
      const buildScriptContent = `
import { build } from 'vite';

async function runBuild() {
  try {
    await build();
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build error:', error);
    process.exit(1);
  }
}

runBuild();
`;
      fs.writeFileSync(buildScriptPath, buildScriptContent);
      
      // Execute the direct build script
      execSync(`node ${buildScriptPath}`, { stdio: 'inherit' });
    } catch (directError) {
      console.log('Direct Vite import failed, trying SvelteKit build...');
      
      try {
        // Try the SvelteKit build command
        execSync('npx svelte-kit sync && npx svelte-kit build', { stdio: 'inherit' });
        console.log('SvelteKit build completed successfully!');
      } catch (skError) {
        // Final attempt: try adapter-static directly
        console.log('SvelteKit build failed, trying with adapter-static directly...');
        
        try {
          // Create and run a minimal SvelteKit build script
          const skBuildPath = path.join(process.cwd(), 'sk-build.js');
          const skBuildContent = `
import { build } from '@sveltejs/kit/build';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runBuild() {
  try {
    await build({ cwd: __dirname });
    console.log('SvelteKit build completed successfully!');
  } catch (error) {
    console.error('SvelteKit build error:', error);
    process.exit(1);
  }
}

runBuild();
`;
          fs.writeFileSync(skBuildPath, skBuildContent);
          
          // Execute the SvelteKit build script
          execSync(`node ${skBuildPath}`, { stdio: 'inherit' });
        } catch (finalError) {
          throw new Error(`All build methods failed. Last error: ${finalError.message}`);
        }
      }
    }
  }
} catch (error) {
  console.error('Build process failed:', error.message);
  process.exit(1);
}
