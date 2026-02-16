import adapterVercel from '@sveltejs/adapter-vercel';
import adapterStatic from '@sveltejs/adapter-static';
import sveltePreprocess from 'svelte-preprocess';

// Use static adapter for iOS builds, Vercel adapter for web deployment
const isIosBuild = process.env.BUILD_TARGET === 'ios';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: sveltePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: isIosBuild
			? adapterStatic({ fallback: 'index.html' })
			: adapterVercel(), // Using default Vercel adapter options
		
		// Development mode optimizations
		env: {
			dir: 'env',
			publicPrefix: 'PUBLIC_'
		},
		
		// Disable SSR in development mode for faster initial load
		csp: { mode: 'auto' },
		
		// Alias configuration for cleaner imports
		alias: {
			'$components': 'src/lib/components',
			'$stores': 'src/lib/stores.js',
			'$utils': 'src/lib/noncomponents'
		}
	}
};

export default config;
