#!/bin/bash

# Cleanup script for old test files
# This removes all the old test files, keeping only the clean ones

echo "🧹 Cleaning up old test files..."

cd tests

# Create archive directory
mkdir -p archive

# Move old test files to archive
echo "Moving old test files to archive..."
mv adaptive-difference-mode.spec.js archive/ 2>/dev/null
mv basic-e2e.spec.js archive/ 2>/dev/null  
mv basic-screenshot.spec.js archive/ 2>/dev/null
mv debug-difference-mode.spec.js archive/ 2>/dev/null
mv difference-mode-stats.spec.js archive/ 2>/dev/null
mv difference-mode.spec.js archive/ 2>/dev/null
mv improved-basic-tests.spec.js archive/ 2>/dev/null
mv improved-difference-mode.spec.js archive/ 2>/dev/null
mv functional-workflow.spec.js archive/ 2>/dev/null
mv simple-difference-mode.spec.js archive/ 2>/dev/null
mv targeted-difference-mode.spec.js archive/ 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
echo "📁 Current test structure:"
ls -la *.spec.js *.md 2>/dev/null
echo ""
echo "📦 Archived files:"
ls -la archive/ 2>/dev/null
echo ""
echo "🚀 You can now commit and push the cleaned up test suite!"