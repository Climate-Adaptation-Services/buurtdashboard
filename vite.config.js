import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			onwarn: (warning, handler) => {
				// Suppress warnings about svelte-carousel missing exports condition
				if (warning.code === 'missing-exports-condition' && warning.message.includes('svelte-carousel')) {
					return;
				}
				handler(warning);
			}
		})
	],
	optimizeDeps: {
		include: [
			'lodash.get', 
			'lodash.isequal', 
			'lodash.clonedeep',
			'd3',
			'topojson-client',
			'topojson-simplify',
			'fflate'
		],
		force: true // Force dependency pre-bundling
	},
	build: {
		reportCompressedSize: false, // Faster builds
		target: 'esnext', // Assume modern browsers for smaller and faster builds
		chunkSizeWarningLimit: 1000 // Increase the size warning limit
	},
	server: {
		fs: {
			strict: false // Allow serving files from one level up the project root
		},
		hmr: {
			overlay: false // Disable the HMR overlay to reduce browser repaints
		}
	},
	
	// Fix client routing
	define: {
		'__SVELTEKIT_CLIENT_ROUTING__': true,
		'__SVELTEKIT_CSR__': true
		// Removed __WS_TOKEN__ to fix syntax error
	},
	esbuild: {
		jsxFactory: 'h',
		jsxFragment: 'Fragment'
	}
});
