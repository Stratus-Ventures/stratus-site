<script lang="ts">
    import NumberTicker from "./NumberTicker.svelte";
	import MetricIcon from "./MetricIcon.svelte";
	import Tooltip from "./Tooltip.svelte";

    interface Props {
        name: string;
        data: number;
        index?: number;
    }

    let { name, data, index = 0 }: Props = $props();

    // Items at the start of each row on mobile (assuming 4 items per row)
    let isFirst = $derived(index % 3 === 0);
    let showTooltip = $state(false);
    let isHovered = $state(false);

</script>

<div class="inline-flex min-w-16 items-center justify-start gap-3">
    <div class="relative">
        <div
            class="flex h-fit w-fit cursor-pointer items-center justify-center"
            role="button"
            tabindex="0"
            onmouseenter={() => { showTooltip = true; isHovered = true; }}
            onmouseleave={() => { showTooltip = false; isHovered = false; }}
        >
            <Tooltip label={name} {isFirst} {showTooltip} />
            <MetricIcon
                iconType={name}
                color={isHovered ? 'var(--color-primary-fg)' : 'var(--color-secondary-fg)'}
                {isHovered}
                size={18}
            />
        </div>
    </div>
    <NumberTicker value={data} class="small text-secondary-fg" />
</div>