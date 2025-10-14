// Main Globe component export
export { default as Globe } from './Globe.svelte';

// Individual globe component exports (for advanced usage)
export { default as BaseGlobe } from './BaseGlobe.svelte';
export { default as EventArc } from './EventArc.svelte';
export { default as EventPoint } from './EventPoint.svelte';
export { default as PhoenixMarker } from './PhoenixMarker.svelte';
export { default as Scene } from './Scene.svelte';

// Globe service exports
export {
	loadGlobeEvents,
	startAnimationCycle,
	getPhoenixCoords,
	activeEvents
} from '$lib/services/GlobeService';

// Types
export type { GlobeEvent, AnimatedEvent } from '$lib/services/GlobeService';
