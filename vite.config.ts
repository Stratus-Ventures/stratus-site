import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['@threlte/core', '@threlte/extras', 'three']
	},
	optimizeDeps: {
		include: ['@threlte/core', '@threlte/extras', 'three'],
		// Force optimization of Three.js addons for better performance
		force: true
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// Three.js core
					'three-core': ['three'],
					// Three.js addons
					'three-addons': ['three/addons/lines/Line2.js', 'three/addons/lines/LineMaterial.js', 'three/addons/lines/LineGeometry.js'],
					// Threlte framework
					'threlte': ['@threlte/core', '@threlte/extras'],
					// Globe components
					'globe': ['$lib/components/globe/Globe.svelte', '$lib/components/globe/Scene.svelte', '$lib/components/globe/BaseGlobe.svelte'],
					// Globe events
					'globe-events': ['$lib/components/globe/EventArc.svelte', '$lib/components/globe/EventPoint.svelte', '$lib/components/globe/PhoenixMarker.svelte'],
					// Services
					'services': ['$lib/services/GlobeService.ts', '$lib/server/services/metrics.ts']
				}
			}
		},
		chunkSizeWarningLimit: 600,
		// Additional performance optimizations
		minify: 'terser',
		target: 'es2020'
	}
});
