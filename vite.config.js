import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { isoImport } from 'vite-plugin-iso-import';

export default defineConfig({
	plugins: [sveltekit(), isoImport()],
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
		'__SVELTEKIT_CSR__': true,
		'__WS_TOKEN__': JSON.stringify('disabled')
	},
	esbuild: {
		jsxFactory: 'h',
		jsxFragment: 'Fragment'
	}
});
