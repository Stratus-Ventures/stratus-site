<script lang="ts">
	import { cn } from '$lib/utils';
	import Metric from './Metric.svelte';

	interface MetricItem {
		name: string;
		value: number;
	}

	interface Props {
		metrics: MetricItem[];
		class?: string;
	}

	let { metrics, class: className = '' }: Props = $props();

	// MAX 6 METRICS
	let displayMetrics = $derived(metrics.slice(0, 6));

</script>

<div class={cn("flex flex-wrap gap-5 w-full h-fit justify-start sm:justify-center items-center", className)}>
	{#each displayMetrics as metric, index}
		<Metric name={metric.name} data={metric.value} {index} />
	{/each}
</div>