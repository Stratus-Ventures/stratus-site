<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { Color, Group, Mesh } from 'three';
	import { Line2 } from 'three/addons/lines/Line2.js';
	import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
	import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
	import { latLngToSphere } from '$lib/utils/geo';
	import { mode } from 'mode-watcher';
	import { tick } from 'svelte';
	import type { GeometryCollection } from 'geojson';

	interface Props {
		radius: number;
	}

	const { size: sizeStore } = useThrelte();
	const { radius }: Props = $props();

	let size = $derived(sizeStore.current);

	// Colors based on theme (reactive using $derived)
	let globeColor = $derived(new Color(mode.current === 'dark' ? '#0A0A0A' : '#FFFFFF'));
	let coastColor = $derived(new Color(mode.current === 'dark' ? '#404040' : '#D4D4D4'));

	let meshRef: Mesh | undefined = $state();
	let coastGroup: Group | null = null;
	let coastMaterials: LineMaterial[] = [];
	let isInitialized = $state(false);

	async function generateCoastlines(r: number, color: Color) {
		const group = new Group();
		coastMaterials = [];

		const { default: data } = await import('./globe-coastline.json');
		const geo = data as GeometryCollection;

		for (const geometry of geo.geometries) {
			const lines =
				geometry.type === 'MultiLineString'
					? geometry.coordinates
					: geometry.type === 'LineString'
						? [geometry.coordinates]
						: [];

			for (const line of lines) {
				const points = [];
				for (const [lon, lat] of line) {
					const v = latLngToSphere(lat, lon, r);
					points.push(v.x, v.y, v.z);
				}

				if (points.length >= 6) {
					const geo = new LineGeometry().setPositions(points);
					const mat = new LineMaterial({
						color: color.getHex(),
						linewidth: 1.5,
						transparent: true,
						opacity: 1,
						depthWrite: false,
						toneMapped: false
					});

					if (size?.width && size?.height) {
						mat.resolution.set(size.width, size.height);
					}

					coastMaterials.push(mat);
					group.add(new Line2(geo, mat));
				}
			}
		}

		return group;
	}

	// Generate coastlines on mount and radius change
	$effect(() => {
		if (!meshRef || !radius) return;
		(async () => {
			await tick();

			// Clean up existing coastlines
			if (coastGroup) {
				meshRef.remove(coastGroup);
				coastGroup.traverse((obj) => {
					if ('geometry' in obj && obj.geometry) {
						const geom = obj.geometry as { dispose?: () => void };
						geom.dispose?.();
					}
					if ('material' in obj && obj.material) {
						const mat = obj.material as { dispose?: () => void };
						mat.dispose?.();
					}
				});
				coastGroup.clear();
			}

			const coastLines = await generateCoastlines(radius, coastColor);
			coastGroup = coastLines;
			meshRef.add(coastLines);

			// Update globe color
			if (meshRef.material && 'color' in meshRef.material) {
				(meshRef.material.color as Color).copy(globeColor);
			}

			isInitialized = true;
		})();
	});

	// Handle color updates without regenerating
	$effect(() => {
		if (!meshRef || !coastColor || !globeColor || !isInitialized) return;

		// Update globe color
		if (meshRef.material && 'color' in meshRef.material) {
			(meshRef.material.color as Color).copy(globeColor);
		}

		// Update coastline colors
		if (coastMaterials.length > 0) {
			const newColorHex = coastColor.getHex();
			coastMaterials.forEach((material) => {
				material.color.setHex(newColorHex);
			});
		}
	});

	// Handle screen resolution updates
	$effect(() => {
		if (!coastMaterials.length || !size) return;

		for (const m of coastMaterials) {
			m.resolution.set(size.width, size.height);
		}
	});
</script>

<T.Mesh bind:ref={meshRef}>
	<T.SphereGeometry args={[radius, 64, 32]} />
	<T.MeshBasicMaterial color={globeColor} toneMapped={false} />
</T.Mesh>
