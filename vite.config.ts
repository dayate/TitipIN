import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		// Code splitting configuration
		rollupOptions: {
			output: {
				// Manual chunks for better caching
				manualChunks: {
					// Vendor chunks - these rarely change
					'vendor-svelte': ['svelte', 'svelte/internal'],
					'vendor-ui': ['bits-ui', 'lucide-svelte', 'clsx', 'tailwind-merge', 'tailwind-variants'],
					'vendor-utils': ['zod', 'nanoid']
				}
			}
		},
		// Minification settings
		minify: 'esbuild',
		// Target modern browsers for smaller bundles
		target: 'es2022',
		// Source maps for debugging in production (optional)
		sourcemap: false,
		// Chunk size warning limit (in kB)
		chunkSizeWarningLimit: 500
	},
	// Optimize dependencies
	optimizeDeps: {
		include: ['lucide-svelte', 'bits-ui', 'clsx', 'tailwind-merge']
	},
	// Server configuration for development
	server: {
		// Preload linked pages for faster navigation
		preTransformRequests: true
	}
});
