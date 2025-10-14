<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { latLngToSphere } from '$lib/utils/geo';
	import { theme } from '$lib/stores/themeStore';
	import type { AnimatedEvent } from '$lib/services/GlobeService';

	interface Props {
		event: AnimatedEvent;
		radius: number;
	}

	const { event, radius }: Props = $props();

	// Point color based on theme (white in dark, black in light) - cached for performance
	let pointColor = $derived($theme === 'dark' ? 0xffffff : 0x000000);

	// Base position on globe surface
	const basePosition = latLngToSphere(event.origin_lat, event.origin_long, radius);

	// Random height variation (up to 0.25x radius) - pre-calculated for performance
	const maxHeight = radius * (0.15 + Math.random() * 0.1);

	// Animation state
	let currentHeight = $state(0);
	const animationStart = event.startTime;
	const RISE_DURATION = 1500; // 1.5 seconds rise
	const HOLD_DURATION = 2000; // 2 seconds hold
	const FALL_DURATION = 1500; // 1.5 seconds fall

	// Animate the ping-pong motion - optimized with early exit
	useTask(() => {
		const elapsed = Date.now() - animationStart;

		if (elapsed < RISE_DURATION) {
			// Phase 1: Rise (0 to maxHeight) with improved easing
			const progress = elapsed / RISE_DURATION;
			// Smoother cubic easing for rise
			const eased = progress < 0.5 
				? 4 * progress * progress * progress 
				: 1 - Math.pow(-2 * progress + 2, 3) / 2;
			currentHeight = maxHeight * eased;
		} else if (elapsed < RISE_DURATION + HOLD_DURATION) {
			// Phase 2: Hold at peak
			currentHeight = maxHeight;
		} else if (elapsed < RISE_DURATION + HOLD_DURATION + FALL_DURATION) {
			// Phase 3: Fall (maxHeight to 0) with improved easing
			const fallElapsed = elapsed - (RISE_DURATION + HOLD_DURATION);
			const progress = fallElapsed / FALL_DURATION;
			// Smoother cubic easing for fall
			const eased = progress < 0.5 
				? 4 * progress * progress * progress 
				: 1 - Math.pow(-2 * progress + 2, 3) / 2;
			currentHeight = maxHeight * (1 - eased);
		} else {
			// Done - early exit for performance
			currentHeight = 0;
			return; // Skip further calculations
		}
	});

	// Calculate current position (base + height along normal)
	const currentPosition = $derived.by(() => {
		// Normal vector points outward from center
		const normal = basePosition.clone().normalize();
		const offset = normal.multiplyScalar(currentHeight);
		const pos = basePosition.clone().add(offset);
		return [pos.x, pos.y, pos.z] as [number, number, number];
	});

	// Opacity fades in/out with height
	const opacity = $derived(Math.min(1, currentHeight / (maxHeight * 0.3)));
</script>

{#if currentHeight > 0.01}
	<!-- Rising point diamond (rotated octahedron) -->
	<T.Mesh position={currentPosition} rotation={[0, 0, Math.PI / 4]}>
		<T.OctahedronGeometry args={[radius * 0.02, 0]} />
		<T.MeshBasicMaterial color={pointColor} transparent={true} {opacity} toneMapped={false} />
	</T.Mesh>

	<!-- Connecting line from surface to point (70% opacity) -->
	<T.Line>
		<T.BufferGeometry>
			{@const positions = new Float32Array([
				basePosition.x,
				basePosition.y,
				basePosition.z,
				...currentPosition
			])}
			<T.BufferAttribute attach="attributes.position" args={[positions, 3]} />
		</T.BufferGeometry>
		<T.LineBasicMaterial
			color={pointColor}
			transparent={true}
			opacity={opacity * 0.99 * 0.7}
			toneMapped={false}
		/>
	</T.Line>
{/if}
