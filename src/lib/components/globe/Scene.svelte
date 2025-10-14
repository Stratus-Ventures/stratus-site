<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import BaseGlobe from './BaseGlobe.svelte';
	import EventArc from './EventArc.svelte';
	import EventPoint from './EventPoint.svelte';
	import PhoenixMarker from './PhoenixMarker.svelte';
	import { activeEvents, loadGlobeEvents, startAnimationCycle } from '$lib/services/GlobeService';
	import { onMount } from 'svelte';

	const { size: sizeStore } = useThrelte();
	let rotation = $state(0);

	// Responsive radius based on viewport size (smaller for better event visibility)
	let size = $derived(sizeStore.current);
	const radius = $derived(size ? Math.min(size.width, size.height) * 0.0035 : 1.5);
	const cameraDistance = $derived(radius * 2.8);

	// Slow auto-rotation
	useTask((dt) => {
		rotation += dt * 0.07;
	});

	// Load events and start animation cycle on mount
	onMount(async () => {
		await loadGlobeEvents();
		startAnimationCycle();
	});
</script>

<!-- Camera -->
<T.PerspectiveCamera
	makeDefault
	fov={60}
	near={0.1}
	far={1000}
	position={[cameraDistance * 0.1, cameraDistance * 0.2, cameraDistance]}
	oncreate={(ref) => ref.lookAt(0, 0, 0)}
>
	<OrbitControls
		enableZoom={false}
		enablePan={false}
		enableDamping
		dampingFactor={0.1}
		rotateSpeed={0.2}
		minPolarAngle={Math.PI * 0.25}
		maxPolarAngle={Math.PI * 0.5}
	/>
</T.PerspectiveCamera>

<!-- Rotating Group (globe + events) -->
<T.Group rotation={[0, rotation, 0]}>
	<!-- Base globe with coastlines -->
	<BaseGlobe {radius} />

	<!-- Phoenix marker (always visible) -->
	<PhoenixMarker {radius} />

	<!-- Event visualizations -->
	{#each $activeEvents as event (event.animationId)}
		{#if event.event_type === 'subscription_activated'}
			<EventArc {event} {radius} />
		{:else if event.event_type === 'user_created'}
			<EventPoint {event} {radius} />
		{/if}
	{/each}
</T.Group>
