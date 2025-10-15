<script lang="ts">
	import { fly } from 'svelte/transition';

	interface Props {
		label: string;
		isFirst: boolean;
		showTooltip: boolean;
	}

	let { label, isFirst, showTooltip }: Props = $props();
</script>

{#if showTooltip}
	<div
		class="
            small-medium absolute bottom-full z-10 mb-2 rounded-md bg-button-bg px-3 py-1.5
            whitespace-nowrap text-button-fg shadow-lg
            {isFirst ? 'left-[1px] lg:left-1/2 lg:-translate-x-1/2' : 'left-1/2 -translate-x-1/2'}
        "
		in:fly={{ y: 4, duration: 300 }}
		out:fly={{ y: 4, duration: 300 }}
	>
		{label.charAt(0).toUpperCase() + label.slice(1)}
		<div
			class="
                absolute top-full h-3 w-3 rotate-45 rounded-br-[3px] bg-button-bg
                {isFirst
				? 'left-[5px] -translate-y-[7px] lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2'
				: 'left-1/2 -translate-x-1/2 -translate-y-1/2'}
            "
		></div>
	</div>
{/if}
