<script lang="ts">
	interface Props {
		icon: any;
		href?: string;
		onClick?: () => void;
		size?: number;
		ariaLabel: string;
	}

	let { icon: IconComponent, href, onClick, size = 16, ariaLabel }: Props = $props();

	// 1. Handle hover state for icon color changes

	// ----------------------------------------------------------- //

	// [ STEP 1. ]
	let isHovered = $state(false);
</script>

{#if href}
	{@const Icon = IconComponent}
	<a
		{href}
		class="
            flex h-fit w-fit cursor-pointer items-center justify-center
            p-1 transition-colors duration-300 ease-in-out"
		aria-label={ariaLabel}
		target="_blank"
		rel="noopener noreferrer"
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
	>
		<Icon
			{size}
			color={isHovered ? 'var(--color-primary-fg)' : 'var(--color-secondary-fg)'}
			{isHovered}
		/>
	</a>
{:else}
	{@const Icon = IconComponent}
	<button
		class="
            flex h-fit w-fit cursor-pointer items-center justify-center
            p-1 transition-colors duration-300 ease-in-out"
		aria-label={ariaLabel}
		onclick={onClick}
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
	>
		<Icon
			{size}
			color={isHovered ? 'var(--color-primary-fg)' : 'var(--color-secondary-fg)'}
			{isHovered}
		/>
	</button>
{/if}
