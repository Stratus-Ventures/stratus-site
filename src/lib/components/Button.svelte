<script lang="ts">
	interface Props {
		label: string;
		href?: string;
		variant?: 'outlined' | 'filled';
		shimmer?: boolean;
		onClick?: () => void;
		type?: 'button' | 'submit' | 'reset';
	}

	let {
		label,
		href,
		variant = 'filled',
		shimmer = false,
		onClick,
		type = 'button'
	}: Props = $props();

	// 1. Compute button classes based on variant
	// 2. Handle shimmer animation with CSS-only approach
	// 3. Handle width adjustment

	// ------------------------------------------------------------------- //

	// [ STEP 1.] - Compute button classes based on variant
	let classes = $derived(`
        flex w-full lg:w-fit h-fit items-center justify-center relative
        rounded-lg button-label px-6 py-3 select-none cursor-pointer theme-transition
        ${
			variant === 'outlined'
				? 'bg-transparent border-1 hover:bg-secondary-bg border-border text-primary-fg'
				: 'bg-button-bg border-1 border-button-bg text-button-fg' 		}
    `);

	// [ STEP 2.] - Handle shimmer animation with CSS-only approach
	let shimmerClasses = $derived(
		shimmer && variant === 'filled' ? 'shimmer-text relative' : 'relative'
	);

	// [ STEP 3.] - Handle width adjustment
	let shimmerWidth = $derived.by(() => {
		if (typeof window === 'undefined') return '200%';
		// Use 300% for mobile (full-width buttons) to maintain speed
		return window.innerWidth < 768 ? '300%' : '200%';
	});
</script>

{#if href}
	<a {href} class={classes} aria-label={label} target="_blank" rel="noopener noreferrer">
		<span
			class={shimmerClasses}
			data-text={label}
			data-no-preview
			style="--shimmer-width: {shimmerWidth}"
		>
			{label}
		</span>
	</a>
{:else}
	<button class={classes} aria-label={label} onclick={onClick} {type}>
		<span
			class={shimmerClasses}
			data-text={label}
			data-no-preview
			style="--shimmer-width: {shimmerWidth}"
		>
			{label}
		</span>
	</button>
{/if}

<style>
	.button-label {
		white-space: nowrap;
	}

	.shimmer-text {
		position: relative;
		color: rgb(var(--color-button-fg));
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-rendering: optimizeLegibility;
	}

	.shimmer-text::before {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			transparent 20%,
			var(--color-button-fg) 50%,
			transparent 80%,
			transparent 100%
		);
		background-size: var(--shimmer-width) 100%;
		background-repeat: no-repeat;
		background-position: 200% 0;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		pointer-events: none;
		opacity: 1;
	}

	a:hover .shimmer-text,
	button:hover .shimmer-text {
		color: var(--color-button-fg-50);
	}

	a:hover .shimmer-text::before,
	button:hover .shimmer-text::before {
		animation: shimmer 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -60% 0;
		}
	}

	@media (max-width: 640px) {
		@keyframes shimmer {
			0% {
				background-position: 160% 0;
			}
			100% {
				background-position: -50% 0;
			}
		}
	}
</style>
