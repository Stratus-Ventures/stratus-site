import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['@threlte/core', '@threlte/extras', 'three']
	},
	optimizeDeps: {
		include: [
			'@threlte/core', 
			'@threlte/extras', 
			'three',
			'three/addons/lines/Line2.js',
			'three/addons/lines/LineMaterial.js',
			'three/addons/lines/LineGeometry.js'
		],
		// Force optimization of Three.js addons for better performance
		force: true,
		// Exclude large dependencies from pre-bundling
		exclude: ['three/examples/jsm/loaders/GLTFLoader.js']
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Three.js core - split into smaller chunks for better caching
					if (id.includes('three/src/core')) return 'three-core';
					if (id.includes('three/src/math')) return 'three-math';
					if (id.includes('three/src/geometries')) return 'three-geometries';
					if (id.includes('three/src/materials')) return 'three-materials';
					if (id.includes('three/src/objects')) return 'three-objects';
					if (id.includes('three/src/renderers')) return 'three-renderers';
					if (id.includes('three/addons/lines')) return 'three-lines';
					if (id.includes('three') && !id.includes('addons')) return 'three-base';
					
					// Threlte framework - split for better loading
					if (id.includes('@threlte/core')) return 'threlte-core';
					if (id.includes('@threlte/extras')) return 'threlte-extras';
					
					// Globe components - separate chunk for lazy loading potential
					if (id.includes('components/globe/')) return 'globe-components';
					
					// Database libraries - separate for server-side optimization
					if (id.includes('node_modules/drizzle-orm')) return 'drizzle';
					if (id.includes('node_modules/postgres')) return 'postgres';
					
					// Split large vendor libraries for better caching
					if (id.includes('node_modules/svelte')) return 'svelte-vendor';
					if (id.includes('node_modules/@sveltejs')) return 'sveltekit-vendor';
					
					// Default vendor chunk for remaining node_modules
					if (id.includes('node_modules')) {
						return 'vendor';
					}
				}
			},
			// Enable tree shaking
			treeshake: {
				preset: 'recommended',
				moduleSideEffects: false
			}
		},
		chunkSizeWarningLimit: 400, // Lower threshold to catch issues earlier
		// Additional performance optimizations
		minify: 'terser',
		target: 'es2020'
	}
});
