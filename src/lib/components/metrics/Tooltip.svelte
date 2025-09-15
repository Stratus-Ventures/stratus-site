<script lang="ts">
	import { fly } from "svelte/transition";

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
            absolute bottom-full z-10 mb-2 rounded-md px-3 py-1.5 whitespace-nowrap shadow-lg
            bg-button-bg text-button-fg small-medium
            {isFirst ? 'left-[1px] sm:left-1/2 sm:-translate-x-1/2' : 'left-1/2 -translate-x-1/2'}
        "
        in:fly={{ y: 4, duration: 300 }}
        out:fly={{ y: 4, duration: 300 }}
    >
        {label.charAt(0).toUpperCase() + label.slice(1)}
        <div
            class="
                absolute top-full h-3 w-3 rotate-45 rounded-br-[3px] bg-button-bg
                {isFirst ? 'left-[5px] -translate-y-[7px] sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2' : 'left-1/2 -translate-x-1/2 -translate-y-1/2'}
            "
        ></div>
    </div>
{/if}