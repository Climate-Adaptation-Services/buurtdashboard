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
	esbuild: {
		jsxFactory: 'h',
		jsxFragment: 'Fragment'
	}
});
