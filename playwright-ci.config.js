import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration optimized for CI/CD environments
 * Uses build + preview instead of dev server to avoid dev-specific issues
 */
export default defineConfig({
	testDir: './tests',
	timeout: 60 * 1000,
	expect: {
		timeout: 5000
	},
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : undefined, // Reduce workers on CI for stability
	reporter: process.env.CI ? 'github' : 'html',
	
	use: {
		actionTimeout: 0,
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure'
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],

	/* Build and serve the app for testing */
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 180 * 1000, // Extended timeout for build + start
		stdout: 'ignore', // Suppress build output noise
		stderr: 'pipe'     // But capture errors
	}
});