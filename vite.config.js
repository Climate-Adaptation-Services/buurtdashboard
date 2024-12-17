import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { isoImport } from 'vite-plugin-iso-import'

export default defineConfig({
	plugins: [sveltekit(), isoImport()],
	optimizeDeps: {
    include: ['lodash.get', 'lodash.isequal', 'lodash.clonedeep', 'd3-force']
  },
  // build: {
  //   rollupOptions: {
  //     external: ['d3-force'],  // Ensure this is NOT marked as external
  //   }
  // }
});
