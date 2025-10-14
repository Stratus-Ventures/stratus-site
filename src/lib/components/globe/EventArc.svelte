<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Line2 } from 'three/addons/lines/Line2.js';
	import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
	import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
	import { Group } from 'three';
	import { createArcPoints } from '$lib/utils/geo';
	import { mode } from 'mode-watcher';
	import type { AnimatedEvent } from '$lib/services/GlobeService';
	import { getPhoenixCoords } from '$lib/services/GlobeService';

	interface Props {
		event: AnimatedEvent;
		radius: number;
	}

	const { event, radius }: Props = $props();
	const { size: sizeStore } = useThrelte();
	const phoenix = getPhoenixCoords();

	// Arc color based on theme (white in dark, black in light)
	let arcColor = $derived(mode.current === 'dark' ? 0xffffff : 0x000000);

	// Create arc geometry from event origin to Phoenix
	// Using 100 segments for smoother arcs
	const arcPoints = createArcPoints(
		event.origin_lat,
		event.origin_long,
		phoenix.lat,
		phoenix.lng,
		radius,
		100
	);

	// Animation state
	let startIndex = $state(0);
	let endIndex = $state(0);
	const animationStart = event.startTime;
	const RISE_DURATION = 2000; // 2 seconds animate from origin to Phoenix
	const HOLD_DURATION = 5000; // 5 seconds hold at Phoenix
	const FALL_DURATION = 2000; // 2 seconds animate back from Phoenix to origin

	// Animate the arc from origin to Phoenix, hold, then back to origin
	useTask(() => {
		const elapsed = Date.now() - animationStart;
		const totalPoints = arcPoints.length;

		if (elapsed < RISE_DURATION) {
			// Phase 1: Animate FROM origin TO Phoenix
			const progress = elapsed / RISE_DURATION;
			startIndex = 0; // Always start at origin
			endIndex = Math.floor(totalPoints * progress); // Grow toward Phoenix
		} else if (elapsed < RISE_DURATION + HOLD_DURATION) {
			// Phase 2: Hold full arc at Phoenix
			startIndex = 0;
			endIndex = totalPoints - 1;
		} else if (elapsed < RISE_DURATION + HOLD_DURATION + FALL_DURATION) {
			// Phase 3: Animate FROM Phoenix back TO origin
			const fallElapsed = elapsed - (RISE_DURATION + HOLD_DURATION);
			const progress = fallElapsed / FALL_DURATION;
			startIndex = Math.floor(totalPoints * progress); // Shrink from origin side
			endIndex = totalPoints - 1; // Keep end at Phoenix
		} else {
			// Done
			startIndex = 0;
			endIndex = 0;
		}
	});

	// Calculate visible portion of arc based on start/end indices
	const visiblePositions = $derived.by(() => {
		if (endIndex - startIndex < 2) return [];

		const result: number[] = [];
		for (let i = startIndex; i <= endIndex; i++) {
			const point = arcPoints[i];
			if (point) {
				result.push(point.x, point.y, point.z);
			}
		}
		return result;
	});

	// Group to hold the Line2
	let groupRef: Group | undefined = $state();
	let line: Line2 | null = null;
	let material: LineMaterial | null = null;

	// Update line when visible positions or color changes
	$effect(() => {
		if (!groupRef) return;

		// Clean up existing line
		if (line && material) {
			groupRef.remove(line);
			line.geometry.dispose();
			material.dispose();
			line = null;
			material = null;
		}

		// Create new line if we have enough points
		if (visiblePositions.length >= 6) {
			const geometry = new LineGeometry().setPositions(visiblePositions);
			material = new LineMaterial({
				color: arcColor,
				linewidth: 2,
				transparent: true,
				opacity: 0.85,
				depthWrite: false,
				depthTest: true,
				toneMapped: false
			});

			// Set resolution
			const size = sizeStore.current;
			if (size?.width && size?.height) {
				material.resolution.set(size.width, size.height);
			}

			line = new Line2(geometry, material);
			groupRef.add(line);
		}
	});

	// Update material resolution on size change
	$effect(() => {
		const size = sizeStore.current;
		if (material && size?.width && size?.height) {
			material.resolution.set(size.width, size.height);
		}
	});
</script>

<T.Group bind:ref={groupRef} />
