<script lang="ts">
	import { T } from '@threlte/core';
	import { HTML, Billboard } from '@threlte/extras';
	import { latLngToSphere } from '$lib/utils/geo';
	import { getPhoenixCoords } from '$lib/services/GlobeService';

	interface Props {
		radius: number;
	}

	const { radius }: Props = $props();
	const phoenix = getPhoenixCoords();

	// Position slightly above globe surface to avoid arc occlusion
	const position = $derived.by(() => {
		const v = latLngToSphere(phoenix.lat, phoenix.lng, radius);
		// Move slightly outward along the normal to avoid arc occlusion
		const normal = v.clone().normalize();
		const offset = normal.multiplyScalar(radius * 0.01); // 1% of radius outward
		const finalPos = v.add(offset);
		return [finalPos.x, finalPos.y, finalPos.z] as [number, number, number];
	});
</script>

<T.Group {position}>

	<!-- Marker dot -->
	<Billboard>
		<HTML occlude center pointerEvents="none" zIndexRange={[1000, 900]}>
			<div
				class="bg-primary pointer-events-none h-[1.2rem] w-[1.2rem] rounded-full border-[3px] border-primary-fg"
			></div>
		</HTML>
	</Billboard>

	<!-- Label -->
	<Billboard>
		<HTML occlude pointerEvents="none" zIndexRange={[1000, 900]}>
			<div class="pointer-events-none -mt-20 -ml-28">
				<div class="flex flex-col items-start">
					<span class="font-mono text-base font-semibold tracking-tight text-primary-fg">
						PHOENIX
					</span>
					<span class="font-mono text-base font-normal tracking-tight text-secondary-fg">
						{phoenix.lat.toFixed(4)}°N
					</span>
					<span class="font-mono text-base font-normal tracking-tight text-secondary-fg">
						{Math.abs(phoenix.lng).toFixed(4)}°W
					</span>
				</div>
			</div>
		</HTML>
	</Billboard>
</T.Group>

<style>
	/* Override Threlte's HTML wrapper overflow for proper label display */
	:global([style*='pointer-events: none; overflow: hidden']) {
		overflow: visible !important;
	}
</style>
