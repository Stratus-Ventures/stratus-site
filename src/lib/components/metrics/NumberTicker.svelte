<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { cn } from '$lib';

	let { value = 100, initial = 0, duration = 8000, class: className = '' } = $props();

	function formatNumber(num: number): string {
		if (num >= 1e12) {
			return (num / 1e12).toFixed(1) + 'T';
		} else if (num >= 1e9) {
			return (num / 1e9).toFixed(1) + 'B';
		} else if (num >= 1e6) {
			return (num / 1e6).toFixed(1) + 'M';
		} else if (num >= 1e3) {
			return (num / 1e3).toFixed(1) + 'K';
		} else {
			return num.toFixed(0);
		}
	}

	// Calculate fixed width based on the target value to prevent any layout shifts
	function getFixedWidth(): string {
		// Use only the target value, not the animated value
		const targetValue = value;

		// Calculate width based on what the final formatted number will look like
		let width: number;

		if (targetValue >= 1e9) {
			width = 3.5; // "999.0B"
		} else if (targetValue >= 1e6) {
			width = 3.2; // "999.0M"
		} else if (targetValue >= 1e3) {
			width = 2.8; // "999.0K"
		} else if (targetValue >= 100) {
			width = 2.2; // "999"
		} else if (targetValue >= 10) {
			width = 1.6; // "99"
		} else {
			width = 1.2; // "9"
		}

		return `${width}rem`;
	}

	let num = new Tween(initial, {
		duration: duration,
		easing: cubicOut
	});

	// Derived reactive value for the formatted number
	let formattedValue = $derived(formatNumber(num.current));

	// Reactive statement to update animation when value changes
	$effect(() => {
		// Only add delay if the value is not 0 (i.e., we have real data)
		// This prevents the 300ms delay on first load when transitioning from 0 to actual metrics
		if (value === 0) {
			num.set(value);
		} else {
			setTimeout(() => {
				num.set(value);
			}, 300);
		}
	});
</script>

<div
	class={cn(className)}
	style="min-width: {getFixedWidth()};"
>
	{formattedValue}
</div>
